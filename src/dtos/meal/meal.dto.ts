import { Schema } from 'mongoose';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { Product } from '../../schemas';

class MealDto {
  @Transform((params) => params.obj._id)
  _id: Schema.Types.ObjectId;

  @IsString()
  name: string;

  @IsString()
  category: string;

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

  @Transform((params) => params.obj.ingredients)
  @IsArray()
  ingredients: Product['_id'][];

  @IsNumber()
  nutritionScore: number;

  @IsString()
  linkToOriginal: string;

  @IsArray()
  @IsOptional()
  tags?: string[];
}

export { MealDto };
