import { Controller, Get } from '@nestjs/common';
import { CronService } from './services/cron.service';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('cron')
export class CronController {
  constructor(private readonly cronService: CronService) {}

  @Public()
  @Get('/')
  async getCronInfo() {
    return this.cronService.cronJobInfo();
  }

  @Public()
  @Get('/export-student-data')
  async exportStudentData() {
    return this.cronService.runExportStudentData();
  }

  @Public()
  @Get('/export-expired-courses')
  async exportExpiredCoursesData() {
    return this.cronService.runExportExpiredStudentCourseData();
  }

  @Public()
  @Get('/add-students-to-group')
  async addStudentsToGroups() {
    return this.cronService.runProcessStudentData();
  }

  @Public()
  @Get('/remove-students-to-group')
  async removeStudentsToGroups() {
    return this.cronService.removeStudentsToGroups();
  }
}
