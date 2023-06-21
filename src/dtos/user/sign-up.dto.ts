import { OmitType } from '@nestjs/swagger';
import { IsOptional, IsString, IsStrongPassword, MinLength } from 'class-validator';
import { UserDto } from './user.dto';

class SignUpDto extends OmitType(UserDto, ['_id']) {
  @IsString()
  @MinLength(12)
    @IsStrongPassword({}, { message: 'Password must include a number, upper and lowercase letters and symbol.' })
  password: string;

  @IsString()
  @IsOptional()
  salt?: string;
}

export { SignUpDto };
