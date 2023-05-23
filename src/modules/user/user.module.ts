import { Logger, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MailerModule } from '../mailer';
import { AuthModule } from '../../auth';

@Module({
  providers: [Logger, UserService],
  controllers: [UserController],
  imports: [AuthModule, MailerModule],
  exports: [UserService],
})
export class UserModule {}
