import { Schema } from 'mongoose';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { Product } from '../../schemas';
import { MealCategory } from '../../enums';

class MealDto {
  @Transform((params) => params.obj._id)
  _id: Schema.Types.ObjectId;

  @IsString()
  name: string;

  @IsEnum(MealCategory)
  category: MealCategory;

  @IsNumber()
  @IsOptional()
  estimatedCookingTimeMinutes?: number;

  @IsString()
  @IsOptional()
  complexity?: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsArray()
  @IsOptional()
  videos?: string[];

  @IsString()
  stepByStepGuide: string;

  @IsArray()
  @Transform((params) => params.obj.ingredients)
  ingredients: Product['_id'][];

  @IsString()
  nutritionScore: string;

  @IsString()
  linkToOriginal: string;

  @IsArray()
  @IsOptional()
  tags?: string[];
}

export { MealDto };
