import { Logger, Module } from '@nestjs/common';
import { MailService } from './mailer.service';

@Module({
  providers: [Logger, MailService],
  exports: [MailService],
})
export class MailerModule {}
