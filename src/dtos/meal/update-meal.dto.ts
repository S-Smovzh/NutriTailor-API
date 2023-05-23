import { OmitType, PartialType } from '@nestjs/swagger';
import { MealDto } from './meal.dto';

class UpdateMealDto extends PartialType(OmitType(MealDto, ['_id'])) {}

export { UpdateMealDto };
