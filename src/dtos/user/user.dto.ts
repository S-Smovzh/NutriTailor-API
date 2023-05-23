import { Schema } from 'mongoose';
import { IsBoolean, IsEmail, IsEnum, IsNumber, IsOptional, IsString, IsStrongPassword, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { DietPlan, SupportedLanguages } from '../../enums';

class UserDto {
  @Transform((params) => params.obj._id)
  _id: Schema.Types.ObjectId;

  @IsEmail()
  email: string;

  @IsBoolean()
  emailVerified: boolean;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsNumber()
  age: number;

  @IsNumber()
  height: number;

  @IsNumber()
  weight: number;

  @IsEnum(DietPlan)
  dietPlan: DietPlan;

  @IsEnum(SupportedLanguages)
  preferredLanguage: SupportedLanguages;
}

class UserFullInfoDto extends UserDto {
  @IsString()
  @Min(12)
  @IsStrongPassword()
  password: string;

  @IsString()
  @IsOptional()
  salt?: string;
}

export { UserDto, UserFullInfoDto };
