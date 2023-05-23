import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage, PopulateOptions, UpdateQuery } from 'mongoose';
import { Meal } from '../schemas';
import { Schemas } from '../enums';
import { CreateMealDto } from '../dtos';
import { ProjectionType } from '../types';

@Injectable()
class MealRepository {
  constructor(@InjectModel(Schemas.MEAL) private readonly mealModel: Model<Meal>) {}

  public async find(filter: FilterQuery<Meal> = {}, projection: ProjectionType<Meal> = {}, population: PopulateOptions[] = []) {
    return this.mealModel.find(filter, projection).populate(population).lean();
  }

  public async findOne(filter: FilterQuery<Meal> = {}, projection: ProjectionType<Meal> = {}, population: PopulateOptions[] = []) {
    return this.mealModel.findOne(filter, projection).populate(population).lean();
  }

  public async findById(id: Meal['_id']) {
    return this.mealModel.findById(id).lean();
  }

  public async countDocuments(filter: FilterQuery<Meal> = {}): Promise<number> {
    return this.mealModel.countDocuments(filter);
  }

  public async create(meal: CreateMealDto) {
    return this.mealModel.create(meal);
  }

  public async findOneAndUpdate(mealId: Meal['_id'], mealUpdated: UpdateQuery<Meal>) {
    await this.mealModel.updateOne({ _id: mealId }, mealUpdated).lean();
    return this.findById(mealId);
  }

  public async findByIdAndDelete(mealId: Meal['_id']) {
    return this.mealModel.findByIdAndDelete(mealId).lean();
  }

  public async deleteMany(filter: FilterQuery<Meal>) {
    return this.mealModel.deleteMany(filter);
  }

  public async aggregate(pipeline: PipelineStage[]) {
    return this.mealModel.aggregate(pipeline);
  }
}

export { MealRepository };
