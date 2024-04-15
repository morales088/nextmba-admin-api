import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { MailerliteCronService } from './mailerlite-cron.service';
import { CourseTierCronService } from './course_tier-cron.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly mailerliteCronService: MailerliteCronService,
    private readonly courseTierCronService: CourseTierCronService
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
      this.delay(1000);
      
      await this.mailerliteCronService.exportCompletedStudentsCourses();
      this.delay(1000);

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
      
      console.log('');
      this.logger.log('Running: Remove students with completed courses to group');
      await this.mailerliteCronService.removeCompletedStudentsToGroups();
      this.delay(1000);

      console.log('');
      this.logger.log('Cron job is done.');

      const job = this.schedulerRegistry.getCronJob('process-student-data');
      this.logger.log(`Next Scheduled Date: ${job.nextDate()}`);
    } catch (error) {
      this.logger.error(`Error in process-student-data cron job: ${error.message}`);
    }
  }

  // @Cron(CronExpression.EVERY_30_MINUTES, {
  //   name: 'process-course-tier',
  //   timeZone: 'Asia/Manila',
  // })
  // async runProcessCourseTier() {
  //   try {
  //     console.log('');
  //     this.logger.log('Running: Process course tier data');

  //     console.log('');
  //     this.logger.log('Running: Update course tier');
  //     await this.courseTierCronService.updateStudentCourseTier();
  //     this.delay(1000);

  //     console.log('');
  //     this.logger.log('Cron job is done.');

  //     const job = this.schedulerRegistry.getCronJob('process-course-tier');
  //     this.logger.log(`Next Scheduled Date: ${job.nextDate()}`);
  //   } catch (error) {
  //     this.logger.error(`Error in process-course-tier cron job: ${error.message}`);
  //   }
  // }

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
