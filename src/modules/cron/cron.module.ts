import { Module } from '@nestjs/common';
import { CronService } from './services/cron.service';
import { CronController } from './cron.controller';
import { MailerliteCronService } from './services/mailerlite-cron.service';
import { StudentsModule } from '../students/students.module';
import { CoursesModule } from '../courses/courses.module';
import { SubscriberGroupsModule } from '../subscriber_groups/subscriber-groups.module';

@Module({
  imports: [StudentsModule, CoursesModule, SubscriberGroupsModule],
  controllers: [CronController],
  providers: [CronService, MailerliteCronService],
  exports: [CronService]
})
export class CronModule {}
