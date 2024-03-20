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

  @Cron(CronExpression.EVERY_DAY_AT_NOON, {
    name: 'export-students-data',
    timeZone: 'Asia/Manila',
  })
  async runExportStudentData() {
    try {
      console.log('');
      this.logger.log('Running: Export students data');

      await this.mailerliteCronService.exportStudentData();
      this.delay(1000);

      await this.mailerliteCronService.exportExpiredStudentCourse();
      this.delay(500);

      console.log('');
      this.logger.log('Cron job is done.');

      const job = this.schedulerRegistry.getCronJob('export-students-data');
      this.logger.log(`Next Scheduled Date: ${job.nextDate()}`);
    } catch (error) {
      this.logger.error(`Error in export-students-data cron job: ${error.message}`);
    }
  }
  // This cron job executes every 5 minutes from 12 midnight to 11 AM, and then from 1 PM to 11 PM.
  @Cron('*/5 0-11,13-23 * * *', {
    // @Cron(CronExpression.EVERY_10_MINUTES, {
    name: 'process-student-data',
    timeZone: 'Asia/Manila',
  })
  async runProcessStudentData() {
    try {
      console.log('');
      this.logger.log('Running: Process student data');

      console.log('');
      this.logger.log('Running: Add student to groups');
      await this.mailerliteCronService.addStudentsToGroups();
      this.delay(1000);

      console.log('');
      this.logger.log('Running: Remove students to group');
      await this.mailerliteCronService.removeStudentsToGroups();
      this.delay(1000);

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
