import { IsEmail, IsString, IsStrongPassword, MinLength } from 'class-validator';

class SignInDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(12)
  @IsStrongPassword({}, { message: 'Password must include a number, upper and lowercase letters and symbol.' })
  password: string;
}

export { SignInDto };
