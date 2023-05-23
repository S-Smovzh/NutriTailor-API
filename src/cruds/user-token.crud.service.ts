import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserToken } from '../schemas';
import { UserTokenRepository } from '../repositories';
import { CreateUserTokenDto, UserTokenDto, UpdateUserTokenDto } from '../dtos';

@Injectable()
export class UserTokenCrudService {
  constructor(
    @Inject(Logger)
    private readonly logger: Logger,
    @Inject(UserTokenRepository)
    private readonly customerTokenRepository: UserTokenRepository,
  ) {}

  public async create(createUserTokenTokenDto: CreateUserTokenDto): Promise<CreateUserTokenDto> {
    const newToken = await this.customerTokenRepository.create(createUserTokenTokenDto);

    if (!newToken) {
      throw new BadRequestException("Couldn't create new token.");
    }
    return plainToInstance(CreateUserTokenDto, newToken);
  }

  public async deleteByValue(tokenValue: UserToken['_id']): Promise<any> {
    return await this.customerTokenRepository.findByTokenValue(tokenValue);
  }

  public async updateByValue(tokenValue: UserToken['value'], updateUserToken: UpdateUserTokenDto): Promise<UserTokenDto> {
    const customer = await this.customerTokenRepository.findOneByTokenAndUpdate(tokenValue, updateUserToken);
    return plainToInstance(UserTokenDto, customer);
  }

  public async findById(tokenId: UserToken['_id']): Promise<UserTokenDto> {
    const customer = await this.customerTokenRepository.findById(tokenId);
    return plainToInstance(UserTokenDto, customer);
  }

  public async findOne(filter: any): Promise<UserTokenDto> {
    const customer = await this.customerTokenRepository.findOne(filter);
    return plainToInstance(UserTokenDto, customer);
  }

  public async findByValue(tokenValue: UserToken['value']): Promise<UserTokenDto> {
    const customerToken = await this.customerTokenRepository.findByTokenValue(tokenValue);
    return plainToInstance(UserTokenDto, customerToken);
  }
}
