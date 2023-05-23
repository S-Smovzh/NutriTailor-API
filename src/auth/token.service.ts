import { Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { JwtPayload, VerifyErrors } from 'jsonwebtoken';
import { User } from '../schemas';
import { UserTokenCrudService } from '../cruds';
import { UserDto } from '../dtos';

export class TokenService {
  constructor(
    @Inject(ConfigService)
    private readonly config: ConfigService,
    @Inject(UserTokenCrudService)
    private readonly userTokenCrudService: UserTokenCrudService,
    @Inject(Logger)
    private readonly logger: Logger,
  ) {}

  public async generateVerificationToken(jwtPayload: UserDto): Promise<{ token: string }> {
    try {
      const secret = this.getSecret();
      const expiresIn = this.config.get('verificationTokenExpirationTime');
      const token = jwt.sign(jwtPayload, secret, { expiresIn });

      await this.userTokenCrudService.create({
        user: jwtPayload._id,
        value: token,
        validToDate: Date.now() + this.config.get('verificationTokenExpirationTimeSeconds') * 1000,
        active: true,
      });

      return { token };
    } catch (err) {
      this.logger.error(`Error generating JWT: ${err}`);
    }
  }

  public generateToken(jwtPayload: any): { token: string } {
    try {
      const secret = this.getSecret();
      const expiresIn = this.config.get('verificationTokenExpirationTime');
      const token = jwt.sign(jwtPayload, secret, { expiresIn });
      return { token };
    } catch (err) {
      this.logger.error(`Error generating JWT: ${err}`);
    }
  }

  public generateJwt(jwtPayload: UserDto, refreshJwtPayload: RefreshPayload): { token: string; refreshToken: string } {
    try {
      const secret = this.getSecret();
      const expiresIn = this.config.get('jwtExpirationTime');
      const token = jwt.sign(jwtPayload, secret, { expiresIn });
      const refreshToken = this.generateRefreshJwt(refreshJwtPayload);
      return { token, refreshToken };
    } catch (err) {
      this.logger.error(`Error generating JWT: ${err}`);
    }
  }

  public async decodeAccessToken(token: string): Promise<{
    user?: UserDto;
    errors?: VerifyErrors | Error;
  }> {
    try {
      const secret = this.getSecret();
      const tokenDecoded: {
        user?: UserDto;
        errors?: VerifyErrors;
      } = { user: null, errors: null };
      await jwt.verify(token, secret, (errors, decoded) => {
        if (errors) {
          tokenDecoded.errors = errors;
        }
        tokenDecoded.user = decoded as UserDto;
      });
      return tokenDecoded;
    } catch (err) {
      this.logger.error(`Error verifying JWT: ${err}`);
    }
  }

  public async decodeToken(token: string): Promise<{
    user?: UserDto;
    errors?: VerifyErrors | Error;
  }> {
    try {
      const { active, validToDate } = await this.userTokenCrudService.findByValue(token);
      const isTokenValid = active && Date.now() < validToDate * 1000;
      if (!isTokenValid) {
        return { errors: new Error('Token inactive or expired!') };
      }

      const secret = this.getSecret();
      const tokenDecoded: {
        user?: UserDto;
        errors?: VerifyErrors;
      } = { user: null, errors: null };
      await jwt.verify(token, secret, (errors, decoded) => {
        if (errors) {
          tokenDecoded.errors = errors;
        }
        tokenDecoded.user = decoded as UserDto;
      });

      await this.userTokenCrudService.updateByValue(token, {
        active: false,
      });

      return tokenDecoded;
    } catch (err) {
      this.logger.error(`Error verifying JWT: ${err}`);
    }
  }

  public decodeInviteToken(token: string): { email: string } {
    try {
      const secret = this.getSecret();
      const tokenDecoded = { email: '' };
      jwt.verify(token, secret, (errors, { email }: JwtPayload) => {
        if (errors) {
          Logger.error(errors);
        }
        tokenDecoded.email = email as string;
      });

      return tokenDecoded;
    } catch (err) {
      this.logger.error(`Error verifying JWT: ${err}`);
    }
  }

  private generateRefreshJwt(payload: RefreshPayload) {
    try {
      const secret = this.getRefreshSecret();
      const expiresIn = this.config.get('refreshJwtExpirationTime');
      return jwt.sign(payload, secret, { expiresIn });
    } catch (err) {
      this.logger.error(`Error generating Refresh JWT: ${err}`);
    }
  }

  public async decodeRefreshToken(token: string): Promise<{ user?: RefreshPayload; errors?: VerifyErrors }> {
    try {
      const secret = this.getRefreshSecret();
      const tokenDecoded: { user?: RefreshPayload; errors?: VerifyErrors } = {
        user: null,
        errors: null,
      };
      await jwt.verify(token, secret, (errors, decoded) => {
        if (errors) {
          tokenDecoded.errors = errors;
        }
        tokenDecoded.user = decoded as RefreshPayload;
      });
      return tokenDecoded;
    } catch (err) {
      this.logger.error(`Error verifying Refresh JWT: ${err}`);
    }
  }

  private getSecret() {
    return this.config.get('jwtSecret');
  }

  private getRefreshSecret() {
    return this.config.get('jwtRefreshSecret');
  }
}

type RefreshPayload = { _id: User['_id'] };
