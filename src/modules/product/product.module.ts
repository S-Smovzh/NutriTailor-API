import { Logger, Module } from '@nestjs/common';
import { ProductController } from './product.controller';

@Module({
  providers: [Logger],
  controllers: [ProductController],
})
export class ProductModule {}
