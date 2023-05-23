import { Schema, Document, Types } from 'mongoose';
import { MealCategory, Schemas } from '../enums';
import { Product } from './product.schema';

interface Meal extends Document {
  name: string;
  category: MealCategory;
  estimatedCookingTimeMinutes?: number;
  complexity?: string;
  images?: string[];
  videos?: string[];
  stepByStepGuide: string;
  ingredients: Product['_id'][];
  nutritionScore: number;
  linkToOriginal: string;
  tags?: string[];
}

const MealSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: MealCategory,
      required: true,
    },
    estimatedCookingTimeMinutes: {
      type: String,
      required: false,
    },
    complexity: {
      type: String,
      required: false,
    },
    images: {
      type: [String],
      required: false,
    },
    videos: {
      type: [String],
      required: false,
    },
    stepByStepGuide: {
      type: String,
      required: true,
    },
    ingredients: {
      type: [Types.ObjectId],
      ref: Schemas.PRODUCT,
      required: true,
    },
    nutritionScore: {
      type: Number,
      required: true,
    },
    linkToOriginal: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      required: false,
    },
  },
  { versionKey: false },
);

export { MealSchema };
export type { Meal };
