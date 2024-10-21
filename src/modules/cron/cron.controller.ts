import { Controller, Get } from '@nestjs/common';
import { CronService } from './services/cron.service';
import { Public } from 'src/common/decorators/public.decorator';
import { MailerLiteService } from 'src/common/mailerlite/mailerlite.service';

@Controller('cron')
export class CronController {
  constructor(
    private readonly cronService: CronService,
    private readonly mailerLiteService: MailerLiteService
  ) {}

  // @Public()
  // @Get('/info')
  // async getCronInfo() {
  //   return this.cronService.cronJobInfo();
  // }

  // @Public()
  // @Get('/test')
  // async test() {
  //   return this.mailerLiteService.getAllSubscribers();
  //   // return this.mailerLiteService.getAllSubscriberGroups();
  // }

  // @Public()
  // @Get('/export-data')
  // async exportStudentData() {
  //   return this.cronService.runExportStudentData();
  // }

  // @Public()
  // @Get('/process-data')
  // async processStudentData() {
  //   return this.cronService.runProcessStudentData();
  // }

  // @Public()
  // @Get('/process-course-tier')
  // async processCourseTier() {
  //   return this.cronService.runProcessCourseTier();
  // }

  // @Public()
  // @Get('/process-payment-leads')
  // async processPaymentLeads() {
  //   return this.cronService.runProcessPaymentLeads();
  // }

  // @Public()
  // @Get('/fix-data')
  // async processFixData() {
  //   return this.cronService.runFixData();
  // }
}
