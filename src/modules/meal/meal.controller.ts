import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { MealEndpoints } from './endpoints.enum';
import { Controllers, MealCategory } from '../../enums';
import { Meal } from '../../schemas';
import { CreateMealDto, MealDto, UpdateMealDto } from '../../dtos';
import { Sort } from '../../types';
import { parseMongoAggregationFilter } from '../../helpers';
import { MealCrudService } from '../../cruds';
import { User } from '../../decorators';
import { ApiParam, ApiQuery } from '@nestjs/swagger';

@Controller(Controllers.MEAL)
export class MealController {
  constructor(
    @Inject(MealCrudService)
    private readonly mealCrudService: MealCrudService,
  ) {}

  @ApiQuery({
    name: 'filter',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @Get(MealEndpoints.GET_PAGINATED)
  public async getPaginated(
    @Query('filter') filter?: string,
    @Query('sort') sort?: string,
    @Query('skip') skip?: number,
    @Query('limit') limit?: number,
  ): Promise<{ items: MealDto[]; itemsCount: number; itemsCountTotal: number }> {
    let filterParsed: any = {};
    let sortParsed: Sort | null = null;
    if (filter) {
      filterParsed = parseMongoAggregationFilter(filter);
    }
    if (sort) {
      sortParsed = JSON.parse(sort);
    }
    return await this.mealCrudService.getPaginated(filterParsed, sortParsed, skip, limit);
  }

  @ApiParam({
    name: 'mealId',
    required: true,
    type: String,
  })
  @Get(MealEndpoints.GET_MEAL_BY_ID)
  public async getMealById(@Param('mealId') mealId: Meal['_id']) {
    await this.mealCrudService.findById(mealId);
  }

  @Post(MealEndpoints.POST_CREATE_MEAL)
  public async createMeal(@User() user, @Body() body: CreateMealDto) {
    await this.mealCrudService.create(body, user._id);
  }

  @ApiParam({
    name: 'mealId',
    required: true,
    type: String,
  })
  @Patch(MealEndpoints.PATCH_UPDATE_MEAL)
  public async updateMealById(@User() user, @Param('mealId') mealId: Meal['_id'], @Body() body: UpdateMealDto) {
    await this.mealCrudService.update(mealId, body, user._id);
  }

  @ApiParam({
    name: 'mealId',
    required: true,
    type: String,
  })
  @Delete(MealEndpoints.DELETE_REMOVE_MEAL)
  public async deleteMealById(@User() user, @Param('mealId') mealId: Meal['_id']) {
    return await this.mealCrudService.delete(mealId, user._id);
  }
}
