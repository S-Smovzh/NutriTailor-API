import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RepositoryModule } from '../repositories/@repository.module';
import { MealCrudService } from './meal.crud.service';
import { ProductCrudService } from './product.crud.service';
import { UserCrudService } from './user.crud.service';
import { UserTokenCrudService } from './user-token.crud.service';

const CRUDs = [MealCrudService, ProductCrudService, UserCrudService, UserTokenCrudService];

@Global()
@Module({
  providers: [Logger, ConfigService, ...CRUDs],
  exports: CRUDs,
  imports: [RepositoryModule],
})
export class CrudModule {}
