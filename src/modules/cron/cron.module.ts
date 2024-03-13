import { Module } from '@nestjs/common';
import { CronService } from './services/cron.service';
import { CronController } from './cron.controller';
import { MailerLiteService } from 'src/common/mailerlite/mailerlite.service';
import { MailerliteCronService } from './services/mailerlite-cron.service';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [StudentsModule],
  controllers: [CronController],
  providers: [CronService, MailerLiteService, MailerliteCronService],
  exports: [CronService, MailerLiteService]
})
export class CronModule {}
