import { Schema } from 'mongoose';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { Measurement } from '../../enums';

class ProductDto {
  @Transform((params) => params.obj._id)
  _id: Schema.Types.ObjectId;

  @IsString()
  name: string;

  @IsEnum(Measurement)
  measurement: Measurement;

  @IsNumber()
  amount: number;

  @Transform((params) => params.obj.user)
  user: Schema.Types.ObjectId;
}

export { ProductDto };
