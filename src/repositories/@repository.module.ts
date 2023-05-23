import { Module } from '@nestjs/common';
import { SchemaModule } from '../schemas/@schema.module';
import { MealRepository } from './meal.repository';
import { ProductRepository } from './product.repository';
import { UserRepository } from './user.repository';
import { UserTokenRepository } from './user-token.repository';

const repositories = [MealRepository, ProductRepository, UserRepository, UserTokenRepository];

@Module({
  imports: [SchemaModule],
  providers: [...repositories],
  exports: [...repositories],
})
export class RepositoryModule {}
