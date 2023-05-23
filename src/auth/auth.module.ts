import { Logger, Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { AuthenticationMiddleware } from './auth.middleware';

@Module({
  providers: [Logger, TokenService, AuthenticationMiddleware],
  exports: [TokenService],
})
export class AuthModule {}
