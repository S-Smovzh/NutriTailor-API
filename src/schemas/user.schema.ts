import { Schema, Document } from 'mongoose';
import { DietPlan, SupportedLanguages } from '../enums';

interface User extends Document {
  emailVerified: boolean;
  email: string;
  firstName: string;
  lastName: string;
  age: number;
  height: number;
  weight: number;
  dietPlan: DietPlan;
  preferredLanguage: SupportedLanguages;
}

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    emailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    dietPlan: {
      type: String,
      enum: DietPlan,
      required: true,
    },
    preferredLanguage: {
      type: String,
      enum: SupportedLanguages,
      required: true,
    },
  },
  { versionKey: false },
);

export { UserSchema };
export type { User };
