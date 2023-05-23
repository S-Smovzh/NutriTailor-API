import { ConflictException, Inject, Injectable, Logger, BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { v4 } from 'uuid';
import * as argon2 from 'argon2';
import { UserRepository } from '../repositories';
import { User } from '../schemas';
import { SignUpDto, UserDto, UpdateProfileDataDto, ResetPasswordDto, UserFullInfoDto } from '../dtos';
import { Sort } from '../types';
import { combinePasswordAndSalt, combinePipeline } from '../helpers';

@Injectable()
export class UserCrudService {
  constructor(
    @Inject(Logger) private readonly logger: Logger,
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  public async create(createUser: SignUpDto): Promise<any> {
    const emailInUse = await this.userRepository.findOne({
      email: createUser.email,
      anonymous: false,
    });

    if (emailInUse) {
      throw new ConflictException('This email is already in use! Please, log in to your account or use a different email.');
    }

    const existingAnonymousUser = await this.userRepository.findOne({
      email: createUser.email,
      anonymous: true,
    });

    createUser.salt = v4();
    createUser.password = await argon2.hash(combinePasswordAndSalt(createUser.password, createUser.salt));

    const user = await this.userRepository.create(createUser);

    if (!user) {
      throw new BadRequestException("Couldn't create new user.");
    }

    return await this.userRepository.findById(user._id);
  }

  public async updatePassword(updateUserPasswordDto: ResetPasswordDto): Promise<UserDto> {
    const salt = v4();
    const password = await argon2.hash(combinePasswordAndSalt(updateUserPasswordDto.newPassword, salt));

    const createdUser = await this.userRepository.findOneAndUpdate(updateUserPasswordDto._id, { password, salt });

    if (!createdUser) {
      throw new BadRequestException("Couldn't update the password.");
    }
    return plainToInstance(UserDto, createdUser);
  }

  public async delete(userId: User['_id']): Promise<any> {
    return await this.userRepository.findByIdAndDelete(userId);
  }

  public async update(userId: User['_id'], updateUser: Partial<UpdateProfileDataDto>): Promise<UserDto> {
    const user = await this.userRepository.findOneAndUpdate(userId, updateUser);
    if (!user) {
      throw new BadRequestException("Couldn't update the user.");
    }
    return plainToInstance(UserDto, user);
  }

  public async findById(userId: User['_id']): Promise<UserDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('The user account not found.');
    }
    return plainToInstance(UserDto, user);
  }

  public async findOneForLogin(email: User['email']): Promise<UserFullInfoDto> {
    const user = await this.userRepository.findOneForLogin(email);

    if (!user) {
      throw new BadRequestException('The user account not found.');
    }

    return plainToInstance(UserFullInfoDto, user);
  }

  public async findOne(filter: any): Promise<UserDto> {
    const user = await this.userRepository.findOne(filter);

    if (!user) {
      throw new BadRequestException('The user account not found.');
    }

    await validate(user);
    return plainToInstance(UserDto, user);
  }

  public async find(filter: any): Promise<User[]> {
    const users = await this.userRepository.find(filter);
    if (!users) {
      this.logger.error('Users accounts not found.');
      return null;
    }
    return users;
  }

  public async getPaginated(
    filter: any,
    sort: Sort,
    skip = 0,
    limit = 30,
  ): Promise<{
    items: UserDto[];
    itemsCount: number;
    itemsCountTotal: number;
  }> {
    const pipeline = combinePipeline(skip, limit, sort, filter);
    const users = await this.userRepository.aggregate(pipeline);
    if (!users) {
      throw new BadRequestException("Users' read operation failed.");
    }
    return {
      items: users.map((doc: User) => plainToInstance(UserDto, doc)),
      itemsCount: await this.userRepository.countDocuments(filter),
      itemsCountTotal: await this.userRepository.countDocuments(),
    };
  }
}
