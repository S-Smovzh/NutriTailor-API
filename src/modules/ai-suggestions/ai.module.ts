import { Logger, Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';

@Module({
  providers: [Logger, AIService],
  controllers: [AIController],
})
export class AiModule {}
