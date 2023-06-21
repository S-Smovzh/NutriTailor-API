import { IsString, IsStrongPassword, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { Schema } from 'mongoose';

class ResetPasswordDto {
  @Transform((params) => params.obj._id)
  _id: Schema.Types.ObjectId;

  @IsString()
  @MinLength(12)
    @IsStrongPassword({}, { message: 'Password must include a number, upper and lowercase letters and symbol.' })
  oldPassword: string;

  @IsString()
  @MinLength(12)
    @IsStrongPassword({}, { message: 'Password must include a number, upper and lowercase letters and symbol.' })
  newPassword: string;
}

class UpdateForgottenPasswordDto {
  @IsString()
  @MinLength(12)
  @IsStrongPassword({}, { message: 'Password must include a number, upper and lowercase letters and symbol.' })
  password: string;

  @IsString()
  @MinLength(12)
  @IsStrongPassword({}, { message: 'Password must include a number, upper and lowercase letters and symbol.' })
  passwordRepeat: string;
}

export { ResetPasswordDto, UpdateForgottenPasswordDto };
