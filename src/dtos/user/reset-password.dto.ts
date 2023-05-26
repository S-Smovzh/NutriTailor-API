import { IsString, IsStrongPassword, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { Schema } from 'mongoose';

class ResetPasswordDto {
  @Transform((params) => params.obj._id)
  _id: Schema.Types.ObjectId;

  @IsString()
  @MinLength(12)
  @IsStrongPassword()
  oldPassword: string;

  @IsString()
  @MinLength(12)
  @IsStrongPassword()
  newPassword: string;
}

export { ResetPasswordDto };
