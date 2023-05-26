import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage, PopulateOptions, UpdateQuery } from 'mongoose';
import { User } from '../schemas';
import { Schemas } from '../enums';
import { SignUpDto } from '../dtos';
import { ProjectionType } from '../types';

@Injectable()
class UserRepository {
  constructor(@InjectModel(Schemas.USER) private readonly userModel: Model<User>) {}

  public async find(filter: FilterQuery<User> = {}, projection: ProjectionType<User> = {}, population: PopulateOptions[] = []) {
    return this.userModel
      .find(filter, { ...projection, password: 0 })
      .populate(population)
      .lean();
  }

  public async findOne(filter: FilterQuery<User> = {}, projection: ProjectionType<User> = {}, population: PopulateOptions[] = []) {
    return this.userModel
      .findOne(filter, { ...projection, password: 0 })
      .populate(population)
      .lean();
  }

  public async findById(id: User['_id']) {
    return this.userModel.findById(id, { password: 0 }).lean();
  }

  public async findOneForLogin(email: User['email']) {
    return this.userModel.findOne({ email }).lean();
  }

  public async countDocuments(filter: FilterQuery<User> = {}): Promise<number> {
    return this.userModel.countDocuments(filter);
  }

  public async create(user: SignUpDto) {
    return this.userModel.create(user);
  }

  public async findOneAndUpdate(userId: User['_id'], userUpdated: UpdateQuery<User>) {
    await this.userModel.updateOne({ _id: userId }, userUpdated).lean();
    return this.findById(userId);
  }

  public async findByIdAndDelete(userId: User['_id']) {
    return this.userModel.findByIdAndDelete(userId).lean();
  }

  public async deleteMany() {
    return this.userModel.deleteMany();
  }

  public async aggregate(pipeline: PipelineStage[]) {
    return this.userModel.aggregate(pipeline);
  }
}

export { UserRepository };
