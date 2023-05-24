import { Logger, Module } from '@nestjs/common';
import { MealController } from './meal.controller';

@Module({
  providers: [Logger],
  controllers: [MealController],
})
export class MealModule {}
