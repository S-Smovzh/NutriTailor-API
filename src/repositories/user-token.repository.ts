import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PopulateOptions, UpdateQuery } from 'mongoose';
import { CreateUserTokenDto } from '../dtos';
import { UserToken } from '../schemas';
import { Schemas } from '../enums';
import { Sort, ProjectionType } from '../types';

@Injectable()
class UserTokenRepository {
  constructor(
    @InjectModel(Schemas.USER_TOKEN)
    private readonly userTokenModel: Model<UserToken>,
  ) {}

  public async find(filter: FilterQuery<UserToken> = {}, sort: Sort = {}) {
    return this.userTokenModel.find(filter).sort(sort).lean();
  }

  public async findById(tokenId: UserToken['_id']) {
    return this.userTokenModel.findById(tokenId).lean();
  }

  public async findByTokenValue(tokenValue: UserToken['value']) {
    return this.userTokenModel.findOne({ value: tokenValue }).lean();
  }

  public async findOne(
    filter: FilterQuery<UserToken> = {},
    projection: ProjectionType<UserToken> = {},
    population: PopulateOptions[] = [],
  ) {
    return this.userTokenModel.findOne(filter, projection).populate(population).lean();
  }

  public async countDocuments(filter: FilterQuery<UserToken> = {}): Promise<number> {
    return this.userTokenModel.countDocuments(filter);
  }

  public async create(tokenData: CreateUserTokenDto) {
    return this.userTokenModel.create(tokenData);
  }

  public async findOneByTokenAndUpdate(tokenValue: UserToken['value'], tokenUpdated: UpdateQuery<UserToken>) {
    return this.userTokenModel.updateOne({ value: tokenValue }, tokenUpdated).lean();
  }

  public async findByTokenValueAndDelete(tokenValue: UserToken['value']) {
    return this.userTokenModel.findOneAndDelete({ value: tokenValue }).lean();
  }

  public async deleteMany(filter: FilterQuery<UserToken> = {}) {
    return this.userTokenModel.deleteMany(filter);
  }
}

export { UserTokenRepository };
