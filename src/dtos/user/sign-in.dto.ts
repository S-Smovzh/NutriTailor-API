import { IsEmail, IsString, IsStrongPassword, MinLength } from 'class-validator';

class SignInDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(12)
  @IsStrongPassword()
  password: string;
}

export { SignInDto };
