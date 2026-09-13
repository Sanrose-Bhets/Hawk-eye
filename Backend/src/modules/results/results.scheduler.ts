import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ResultsService } from './results.service.js';

@Injectable()
export class ResultsScheduler {
  private readonly logger = new Logger(ResultsScheduler.name);

  constructor(private readonly resultsService: ResultsService) {}

  // Weekly on Monday 08:00 (server time). Override via PERFORMANCE_CRON env if needed.
  @Cron(process.env.PERFORMANCE_CRON || '0 8 * * 1')
  async handlePerformanceSweep() {
    this.logger.log('Running weekly performance decrease sweep');
    try {
      const res =
        await this.resultsService.checkAllStudentsForPerformanceDrop();
      this.logger.log(
        `Performance sweep done: checked=${res.checked} notified=${res.notified} queued=${res.queued}`,
      );
    } catch (err) {
      this.logger.error(
        `Performance sweep failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
    }
  }
}
