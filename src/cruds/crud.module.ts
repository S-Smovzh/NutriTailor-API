import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MealCrudService } from './meal.crud.service';
import { ProductCrudService } from './product.crud.service';
import { UserCrudService } from './user.crud.service';
import { RepositoryModule } from '../repositories/@repository.module';

const CRUDs = [MealCrudService, ProductCrudService, UserCrudService];

@Global()
@Module({
  providers: [Logger, ConfigService, ...CRUDs],
  exports: CRUDs,
  imports: [RepositoryModule],
})
export class CrudModule {}
