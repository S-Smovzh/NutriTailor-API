import { Controller, Get, Inject, Logger } from '@nestjs/common';
import { ScriptService } from './script.service';
import { ScriptEndpoints } from './endpoints.enum';
import { Controllers } from '../../enums';

@Controller(Controllers.SCRIPT)
export class ScriptController {
  constructor(
    @Inject(Logger)
    private readonly logger: Logger,
    @Inject(ScriptService)
    private readonly scriptService: ScriptService,
  ) {
    this.logger.log('ScriptController', 'Seed process started');
  }

  @Get(ScriptEndpoints.GET_RUN_SEED)
  public async seed(): Promise<void> {
    return await this.scriptService.startSeed();
  }
}
