import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { MailerliteCronService } from './mailerlite-cron.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly mailerliteCronService: MailerliteCronService
  ) {}

  @Cron(CronExpression.EVERY_12_HOURS, {
    name: 'export-students-data',
    timeZone: 'Asia/Manila',
  })
  async runExportStudentData() {
    try {
      console.log('');
      this.logger.log('Running: Export students data');

      // await this.mailerliteCronService.exportStudentData();
      this.delay(1000);

      // await this.mailerliteCronService.exportExpiredStudentCourse();
      this.delay(500);

      console.log('');
      this.logger.log('Cron job is done.');

      const job = this.schedulerRegistry.getCronJob('export-students-data');
      this.logger.log(`Next Scheduled Date: ${job.nextDate()}`);
    } catch (error) {
      this.logger.error(`Error in export-students-data cron job: ${error.message}`);
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES, {
    name: 'process-student-data',
    timeZone: 'Asia/Manila',
  })
  async runProcessStudentData() {
    try {
      console.log('');
      this.logger.log('Running: Process student data');

      await this.mailerliteCronService.addStudentsToGroups();
      this.delay(1000);

      await this.mailerliteCronService.removeStudentsToGroups();
      this.delay(500);

      console.log('');
      this.logger.log('Cron job is done.');

      const job = this.schedulerRegistry.getCronJob('process-student-data');
      this.logger.log(`Next Scheduled Date: ${job.nextDate()}`);
    } catch (error) {
      this.logger.error(`Error in process-student-data cron job: ${error.message}`);
    }
  }

  async cronJobInfo() {
    const jobs = this.schedulerRegistry.getCronJobs();
    const jobInfo = [];

    jobs.forEach((value, key, map) => {
      let next;

      try {
        next = value.nextDates(4);
      } catch (error) {
        next = 'error: next fire date is in the past!';
      }

      jobInfo.push({ job: key, next });
    });

    return jobInfo;
  }

  private async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
