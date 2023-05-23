import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { Logger, MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { loadConfig } from './configuration';
import { Mongoose, MongooseService } from './mongoose';
import {
  AiModule,
  MailerModule,
  MealEndpoints,
  MealModule,
  ProductEndpoints,
  ProductModule,
  ScriptModule,
  UserEndpoints,
  UserModule,
} from './modules';
import { AuthModule, AuthenticationMiddleware, TokenService } from './auth';
import { ResponseTypeInterceptor } from './interceptors';
import { Controllers } from './enums';
import { CrudModule } from './cruds';
import { RepositoryModule } from './repositories/@repository.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadConfig],
    }),
    { module: Mongoose, global: true },
    AiModule,
    AuthModule,
    { module: CrudModule, global: true },
    MailerModule,
    MealModule,
    ProductModule,
    { module: RepositoryModule, global: true },
    ScriptModule,
    UserModule,
    ThrottlerModule.forRoot({
      ttl: 1,
      limit: 10,
    }),
  ],
  providers: [
    Logger,
    TokenService,
    MongooseService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTypeInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticationMiddleware)
      .exclude(
        { path: `${Controllers.MEAL}${MealEndpoints.GET_PAGINATED}`, method: RequestMethod.GET },
        { path: `${Controllers.MEAL}${MealEndpoints.GET_MEAL_BY_ID}`, method: RequestMethod.GET },
        { path: `${Controllers.PRODUCT}${ProductEndpoints.GET_PAGINATED}`, method: RequestMethod.GET },
        { path: `${Controllers.PRODUCT}${ProductEndpoints.GET_PRODUCT_BY_ID}`, method: RequestMethod.GET },
        { path: `${Controllers.USER}${UserEndpoints.POST_REGISTER}`, method: RequestMethod.POST },
        { path: `${Controllers.USER}${UserEndpoints.POST_LOGIN}`, method: RequestMethod.POST },
        { path: `${Controllers.USER}${UserEndpoints.PATCH_RESET_PASSWORD}`, method: RequestMethod.PATCH },
        { path: `${Controllers.USER}${UserEndpoints.PATCH_ACTIVATE_ACCOUNT}`, method: RequestMethod.PATCH },
        { path: `${Controllers.USER}${UserEndpoints.PATCH_UPDATE_PASSWORD}`, method: RequestMethod.PATCH },
      )
      .forRoutes(Controllers.AI_SUGGESTIONS, Controllers.MEAL, Controllers.PRODUCT, Controllers.USER);
  }
}
