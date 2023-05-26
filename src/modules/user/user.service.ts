import { BadRequestException, ConflictException, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import * as argon2 from 'argon2';
import { v4 } from 'uuid';
import { TokenService } from '../../auth';
import { MailService } from '../mailer';
import { User } from '../../schemas';
import { UserCrudService, UserTokenCrudService } from '../../cruds';
import { SignUpDto, SignInDto, UserDto, ResetPasswordDto } from '../../dtos';
import { combinePasswordAndSalt } from '../../helpers';

@Injectable()
export class UserService {
  private readonly FRONTEND_BASE_URL: string;

  constructor(
    @Inject(Logger)
    private readonly logger: Logger,
    @Inject(UserCrudService)
    private readonly userCrudService: UserCrudService,
    @Inject(UserTokenCrudService)
    private readonly userTokenCrudService: UserTokenCrudService,
    @Inject(TokenService)
    private readonly tokenService: TokenService,
    @Inject(ConfigService)
    private readonly config: ConfigService,
    @Inject(MailService)
    private readonly mailService: MailService,
  ) {
    this.FRONTEND_BASE_URL = this.config.get('frontendBaseUrl');
  }

  public async register(createUserDto: SignUpDto): Promise<void> {
    const user = await this.findByEmail(createUserDto.email);

    if (user) {
      throw new ConflictException('Account with such email already exists.');
    }

    const newlyCreatedUser = await this.userCrudService.create({ ...createUserDto});

    const textTemplateName = 'user-verify-email.txt';
    const htmlTemplateName = 'user-verify-email.mjml';
    const subjectTemplate = 'user-verify-email.subject.txt';

    this.logger.log('Sending user-verify-email mail');
    const { token } = await this.tokenService.generateVerificationToken(newlyCreatedUser);

    const data = {
      userAppBaseUrl: this.FRONTEND_BASE_URL,
      token,
    };

    return this.mailService.send({
      subjectTemplate,
      textTemplateName,
      htmlTemplateName,
      email: newlyCreatedUser.email,
      language: newlyCreatedUser.preferredLanguage,
      data,
    });
  }

  public async login(loginDto: SignInDto): Promise<UserWithToken> {
    const user = await this.userCrudService.findOneForLogin(loginDto.email);

    if (!user) {
      throw new BadRequestException('Incorrect login details!');
    }

    if (!user.emailVerified) {
      throw new BadRequestException('Your account is deactivated. Please, check your email.');
    }

    const passwordVerification = await argon2.verify(user.password, combinePasswordAndSalt(loginDto.password, user.salt));

    if (!passwordVerification) {
      throw new BadRequestException('Incorrect login details!');
    }

    const { token, refreshToken } = await this.tokenService.generateJwt(user, { _id: user._id });
    delete user.password;
    delete user.salt;
    return { ...user, token, refreshToken };
  }

  public async findByEmail(email: User['email']): Promise<UserDto | null> {
    const user = await this.userCrudService.findOne({ email });
    if (!user) {
      return null;
    }
    return plainToInstance(UserDto, user);
  }

  public async deleteAccount(userId: User['_id']): Promise<{ success: boolean }> {
    await this.userCrudService.delete(userId);
    return { success: true };
  }

  public async resetPassword(email: User['email']): Promise<void> {
    const user = await this.userCrudService.findOneForLogin(email);
    const { _id, salt, password } = user;

    if (password && salt) {
      throw new UnauthorizedException(
        'Your account has been blocked. Check your email for verification message or contact our support team.',
      );
    }

    if (!salt || !password) {
      throw new BadRequestException('You have already requested a password reset. Check your email.');
    }

    await this.userCrudService.update(_id, { salt: null, password: null });

    const textTemplateName = 'user-reset-password.txt';
    const htmlTemplateName = 'user-reset-password.mjml';
    const subjectTemplate = 'user-reset-password.subject.txt';

    this.logger.log('Sending user reset password mail');
    const { token } = await this.tokenService.generateVerificationToken(user);

    await this.mailService.send({
      subjectTemplate,
      htmlTemplateName,
      textTemplateName,
      email: user.email,
      language: user.preferredLanguage,
      data: {
        userAppBaseUrl: this.FRONTEND_BASE_URL,
        token,
      },
    });
  }

  public async updateAccountPassword(userId: User['_id'], updateUserPasswordDto: ResetPasswordDto): Promise<UserWithToken> {
    const user = await this.userCrudService.findById(userId);

    const salt = v4();
    const password = await argon2.hash(combinePasswordAndSalt(updateUserPasswordDto.newPassword, salt));
    await this.userCrudService.update(user._id, { password, salt });

    const { token, refreshToken } = await this.tokenService.generateJwt(user, { _id: user._id });
    return { ...user, token, refreshToken };
  }

  public async activateAccount(activationToken: string, isEmailVerification: boolean): Promise<{ success: boolean } & Partial<Tokens>> {
    const userToken = await this.userTokenCrudService.findByValue(activationToken);

    if (!userToken) {
      throw new BadRequestException('Invalid activation token.');
    }

    const userByToken = await this.userCrudService.findById(userToken.user);

    if (!userByToken) {
      throw new BadRequestException('Your account has been removed. Create a new one or contact our support team.');
    }

    if (userByToken.emailVerified) {
      throw new BadRequestException('You have already verified your email.');
    }

    const { user: userId, errors } = await this.tokenService.decodeToken(activationToken);

    if (errors) {
      throw new BadRequestException(errors.message);
    }

    if (!userId) {
      throw new BadRequestException('Invalid activation token.');
    }

    await this.userCrudService.update(userByToken._id, { emailVerified: isEmailVerification });

    const { token, refreshToken } = await this.tokenService.generateJwt(userByToken, { _id: userByToken._id.toString() });
    return { success: true, token, refreshToken };
  }
}

type Tokens = { token: string; refreshToken: string };
type UserWithToken = UserDto & Tokens;
export type { UserWithToken };
