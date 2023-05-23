import { OmitType, PartialType } from '@nestjs/swagger';
import { UserTokenDto } from './user-token.dto';

class UpdateUserTokenDto extends PartialType(OmitType(UserTokenDto, ['_id'])) {}

export { UpdateUserTokenDto };
