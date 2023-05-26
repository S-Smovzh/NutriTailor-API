import { OmitType } from '@nestjs/swagger';
import { IsOptional, IsString, IsStrongPassword, MinLength } from 'class-validator';
import { UserDto } from './user.dto';

class SignUpDto extends OmitType(UserDto, ['_id']) {
  @IsString()
  @MinLength(12)
  @IsStrongPassword()
  password: string;

  @IsString()
  @IsOptional()
  salt?: string;
}

export { SignUpDto };
