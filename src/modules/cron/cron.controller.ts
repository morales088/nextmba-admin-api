import { Controller, Get } from '@nestjs/common';
import { CronService } from './services/cron.service';
import { Public } from 'src/common/decorators/public.decorator';
import { CourseGroupService } from '../../common/utils/course-group.service';
import { MailerLiteService } from 'src/common/mailerlite/mailerlite.service';

@Controller('cron')
export class CronController {
  constructor(
    private readonly cronService: CronService,
    private readonly mailerLiteService: MailerLiteService,
    private readonly courseGroupService: CourseGroupService
  ) {}

  @Public()
  @Get('/info')
  async getCronInfo() {
    // return this.cronService.cronJobInfo();
    return this.mailerLiteService.getAllSubscriberGroups();
  }

  @Public()
  @Get('/test')
  async test() {
    // this.courseGroupService.addMapping('2', 9994268874847133333);
    return this.courseGroupService.getCourseGroupMapping()['2'];
  }

  @Public()
  @Get('/export-data')
  async exportStudentData() {
    return this.cronService.runExportStudentData();
  }

  @Public()
  @Get('/process-data')
  async processStudentData() {
    return this.cronService.runProcessStudentData();
  }
}
