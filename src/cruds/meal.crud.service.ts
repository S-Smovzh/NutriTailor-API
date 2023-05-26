import { Inject, Injectable, Logger, BadRequestException } from '@nestjs/common';
import { UpdateQuery } from 'mongoose';
import { plainToInstance } from 'class-transformer';
import { MealRepository } from '../repositories';
import { Meal, User } from '../schemas';
import { CreateMealDto, MealDto } from '../dtos';
import { combinePipeline, DEFAULT_LIMIT, DEFAULT_SKIP } from '../helpers';
import { Sort } from '../types';

@Injectable()
export class MealCrudService {
  constructor(
    @Inject(Logger) private readonly logger: Logger,
    @Inject(MealRepository)
    private readonly mealRepository: MealRepository,
  ) {}

  public async create(createMeal: CreateMealDto, userId: User['_id']): Promise<MealDto[]> {
    const meal = await this.mealRepository.create(createMeal);

    if (!meal) {
      throw new BadRequestException("Couldn't add new meal.");
    }

    const meals = await this.mealRepository.find({ user: userId });
    return meals.map((meal) => plainToInstance(MealDto, meal));
  }

  public async delete(mealId: Meal['_id'], userId: User['_id']): Promise<MealDto[]> {
    await this.mealRepository.findByIdAndDelete(mealId);
    const meals = await this.mealRepository.find({ user: userId });
    return meals.map((meal) => plainToInstance(MealDto, meal));
  }

  public async update(mealId: Meal['_id'], updateMeal: UpdateQuery<Meal>, userId: User['_id']): Promise<MealDto[]> {
    const meal = await this.mealRepository.findOneAndUpdate(mealId, updateMeal);

    if (!meal) {
      throw new BadRequestException("Couldn't update the meal.");
    }

    const meals = await this.mealRepository.find({ user: userId });
    return meals.map((meal) => plainToInstance(MealDto, meal));
  }

  public async findById(mealId: Meal['_id']): Promise<MealDto> {
    const meal = await this.mealRepository.findById(mealId);
    if (!meal) {
      throw new BadRequestException('The meal account not found.');
    }
    return plainToInstance(MealDto, meal);
  }

  public async findOne(filter: any): Promise<MealDto> {
    const meal = await this.mealRepository.findOne(filter);

    if (!meal) {
      throw new BadRequestException('The meal account not found.');
    }

    return plainToInstance(MealDto, meal);
  }

  public async find(filter: any): Promise<MealDto[]> {
    const meals = await this.mealRepository.find(filter);
    if (!meals) {
      this.logger.error('Meals accounts not found.');
      return null;
    }
    return meals.map((meal) => plainToInstance(MealDto, meal));
  }

  public async getPaginated(
    filter: any,
    sort: Sort,
    skip = DEFAULT_SKIP,
    limit = DEFAULT_LIMIT,
  ): Promise<{
    items: MealDto[];
    itemsCount: number;
    itemsCountTotal: number;
  }> {
    const pipeline = combinePipeline(skip, limit, sort, filter);
    const meals = await this.mealRepository.aggregate([
      { $lookup: { from: 'products', localField: 'ingredients', foreignField: '_id', as: 'ingredients' } },
      ...pipeline,
    ]);
    if (!meals) {
      throw new BadRequestException("Meals' read operation failed.");
    }
    return {
      items: meals.map((doc: Meal) => plainToInstance(MealDto, doc)),
      itemsCount: await this.mealRepository.countDocuments(filter),
      itemsCountTotal: await this.mealRepository.countDocuments(),
    };
  }
}
