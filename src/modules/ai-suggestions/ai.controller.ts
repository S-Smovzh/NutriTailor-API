import { Body, Controller, Get, Inject, Logger, Param, Post } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { AIService } from './ai.service';
import { AIEndpoints } from './endpoints.enum';
import { Product } from '../../schemas';
import { Controllers, MealCategory } from '../../enums';
import { User } from '../../decorators';

@Controller(Controllers.AI_SUGGESTIONS)
export class AIController {
  constructor(
    @Inject(Logger)
    private readonly logger: Logger,
    @Inject(AIService)
    private readonly aiService: AIService,
  ) {
    this.logger.log('AIController', 'Seed process started');
  }

  @ApiParam({
    name: 'mealCategory',
    required: false,
    type: String,
    enum: MealCategory,
  })
  @Get(AIEndpoints.GET_ANY_BY_MEAL_CATEGORY)
  public async getAny(@User() user, @Param('mealCategory') mealCategory: MealCategory): Promise<any> {
    return await this.aiService.getRecipeFromAI(mealCategory, user.dietPlan);
  }

  @ApiParam({
    name: 'mealCategory',
    required: false,
    type: String,
    enum: MealCategory,
  })
  @Post(AIEndpoints.POST_BY_MEAL_CATEGORY_AND_GIVEN_PRODUCT)
  public async getByIngredients(
    @User() { dietPlan },
    @Param('mealCategory') mealCategory: MealCategory,
    @Body() { products }: { products: Product[] },
  ): Promise<any> {
    return await this.aiService.getRecipeFromAI(mealCategory, dietPlan, products);
  }
}
