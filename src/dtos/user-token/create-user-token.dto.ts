import { OmitType } from '@nestjs/swagger';
import { UserTokenDto } from './user-token.dto';

class CreateUserTokenDto extends OmitType(UserTokenDto, ['_id']) {}

export { CreateUserTokenDto };
