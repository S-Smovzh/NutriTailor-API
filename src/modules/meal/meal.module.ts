import { Inject, Logger, Module } from '@nestjs/common';
import { ScriptService } from './script.service';
import { ScriptController } from './script.controller';

@Module({
  providers: [Logger, ScriptService],
  controllers: [ScriptController],
})
export class MealModule {
  constructor(
    @Inject(Logger)
    private readonly logger: Logger,
    @Inject(ScriptService)
    private readonly scriptService: ScriptService,
  ) {
    this.scriptService
      .startSeed()
      .then(() => this.logger.log('ScriptModule', 'Seed process was successfully'))
      .catch((e) => this.logger.error(`Failed to seed the database: ${e.message}`));
  }
}
