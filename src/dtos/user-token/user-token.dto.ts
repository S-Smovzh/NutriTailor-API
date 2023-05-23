import { Schema } from 'mongoose';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

class UserTokenDto {
  @Transform((params) => params.obj._id)
  _id: Schema.Types.ObjectId;

  @IsNumber()
  validToDate: number;

  @Transform((params) => params.obj.user)
  user: Schema.Types.ObjectId;

  @IsString()
  value: string;

  @IsBoolean()
  active: boolean;
}

export { UserTokenDto };
