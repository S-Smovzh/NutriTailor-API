import { OmitType, PartialType } from '@nestjs/swagger';
import { ProductDto } from './product.dto';

class UpdateProductDto extends PartialType(OmitType(ProductDto, ['_id'])) {}

export { UpdateProductDto };
