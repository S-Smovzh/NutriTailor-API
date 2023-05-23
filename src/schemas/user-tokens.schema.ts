import { Schema, Document, Types } from 'mongoose';
import { Schemas } from '../enums';

interface UserToken extends Document {
  validToDate: number;
  user: Types.ObjectId;
  value: string;
  active: boolean;
}

const UserTokenSchema = new Schema(
  {
    validToDate: {
      type: Number,
      required: true,
    },
    user: {
      type: Types.ObjectId,
      ref: Schemas.USER,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  { versionKey: false },
);

export { UserTokenSchema };
export type { UserToken };
