import { Schema, Document, Types } from 'mongoose';
import { Measurement, Schemas } from '../enums';
import { User } from './user.schema';

interface Product extends Document {
  name: string;
  measurement: Measurement;
  amount: number;
  user?: User['_id'];
}

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    measurement: {
      type: String,
      enum: Measurement,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    user: {
      type: Types.ObjectId,
      ref: Schemas.USER,
      required: false,
    },
  },
  { versionKey: false },
);

export { ProductSchema };
export type { Product };
