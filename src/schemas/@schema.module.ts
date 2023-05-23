import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MealSchema } from './meal.schema';
import { ProductSchema } from './product.schema';
import { UserSchema } from './user.schema';
import { UserTokenSchema } from './user-tokens.schema';
import { Schemas } from '../enums';

const schemas = [
  { name: Schemas.MEAL, schema: MealSchema },
  { name: Schemas.PRODUCT, schema: ProductSchema },
  { name: Schemas.USER, schema: UserSchema },
  { name: Schemas.USER_TOKEN, schema: UserTokenSchema },
];

@Module({
  imports: [MongooseModule.forFeature(schemas)],
  exports: [MongooseModule.forFeature(schemas)],
})
export class SchemaModule {}
