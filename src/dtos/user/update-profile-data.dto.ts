import { IsEmail, IsEnum, IsNumber, IsOptional, IsString, IsStrongPassword, MinLength } from 'class-validator';
import { DietPlan, SupportedLanguages } from '../../enums';

class UpdateProfileDataDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsEnum(DietPlan)
  dietPlan?: DietPlan;

  @IsOptional()
  @IsEnum(SupportedLanguages)
  preferredLanguage?: SupportedLanguages;
}

class UpdateFullProfileDataDto extends UpdateProfileDataDto {
  @IsOptional()
  @IsString()
  @MinLength(12)
  @IsStrongPassword({}, { message: 'Password must include a number, upper and lowercase letters and symbol.' })
  password?: string;

  @IsOptional()
  @IsString()
  salt?: string;
}

export { UpdateProfileDataDto, UpdateFullProfileDataDto };
