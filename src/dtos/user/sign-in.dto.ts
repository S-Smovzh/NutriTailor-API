import { IsEmail, IsString, IsStrongPassword, Min } from 'class-validator';

class SignInDto {
  @IsEmail()
  email: string;

  @IsString()
  @Min(12)
  @IsStrongPassword()
  password: string;
}

export { SignInDto };
