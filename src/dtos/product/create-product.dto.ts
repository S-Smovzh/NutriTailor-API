import { OmitType } from '@nestjs/swagger';
import { ProductDto } from './product.dto';

class CreateProductDto extends OmitType(ProductDto, ['_id']) {}

export { CreateProductDto };
