import { OmitType } from '@nestjs/swagger';
import { MealDto } from './meal.dto';

class CreateMealDto extends OmitType(MealDto, ['_id']) {}

export { CreateMealDto };
