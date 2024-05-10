import { Module } from '@nestjs/common';
import { CronService } from './services/cron.service';
import { CronController } from './cron.controller';
import { MailerliteCronService } from './services/mailerlite-cron.service';
import { StudentsModule } from '../students/students.module';
import { CoursesModule } from '../courses/courses.module';
import { SubscriberGroupsModule } from '../subscriber_groups/subscriber-groups.module';
import { CourseTierCronService } from './services/course_tier-cron.service';
import { PaymentsModule } from '../payments/payments.module';
import { PaymentLeadsCronService } from './services/payment-leads-cron.service';

@Module({
  imports: [PaymentsModule, StudentsModule, CoursesModule, SubscriberGroupsModule],
  controllers: [CronController],
  providers: [CronService, MailerliteCronService, CourseTierCronService, PaymentLeadsCronService],
  exports: [CronService],
})
export class CronModule {}
