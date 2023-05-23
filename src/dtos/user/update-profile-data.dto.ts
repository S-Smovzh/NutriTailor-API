import { OmitType } from '@nestjs/swagger';
import { UserFullInfoDto } from './user.dto';

class UpdateProfileDataDto extends OmitType(UserFullInfoDto, ['_id']) {}

export { UpdateProfileDataDto };
