import { Module } from '@nestjs/common';
import { CronService } from './services/cron.service';
import { CronController } from './cron.controller';
import { MailerLiteService } from 'src/common/mailerlite/mailerlite.service';
import { MailerliteCronService } from './services/mailerlite-cron.service';
import { StudentsModule } from '../students/students.module';
import { MailerliteMappingService } from 'src/common/mailerlite/mailerlite-mapping.service';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [StudentsModule, CoursesModule],
  controllers: [CronController],
  providers: [CronService, MailerLiteService, MailerliteCronService, MailerliteMappingService],
  exports: [CronService, MailerLiteService]
})
export class CronModule {}
