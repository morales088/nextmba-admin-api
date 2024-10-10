import { Controller, Param, Patch, Post, Query, Get } from '@nestjs/common';
import { StudentPlanService } from './services/student-plan.service';
import { fromUnixTime } from 'date-fns';

@Controller('student-plan')
export class StudentPlanController {
  constructor(private readonly studentPlanService: StudentPlanService) {}

  @Get('/:studentId')
  async getSubscriptionDetails(@Param('studentId') studentId: number) {
    return this.studentPlanService.findSubscriptionDetails(studentId);
  }

  @Post('/activate-trial/:studentId')
  async activateTrial(@Param('studentId') studentId: number) {
    return await this.studentPlanService.activateTrial(studentId);
  }

  @Patch('/end-trial/:studentId')
  async endTrial(@Param('studentId') studentId: number) {
    return await this.studentPlanService.endTrial(studentId);
  }

  @Post('/activate-premium/:studentId/:')
  async activatePremium(@Param() activatePremiumParams: { studentId: number; startDate: number; endDate: number }) {
    const { studentId, startDate, endDate } = activatePremiumParams;
    return await this.studentPlanService.activatePremium(studentId, fromUnixTime(startDate), fromUnixTime(endDate));
  }

  @Patch('/renew-premium/:studentId/:endDate')
  async renewPremium(@Param('studentId') studentId: number, @Param('endDate') endDate: number) {
    return await this.studentPlanService.renewPremium(studentId, fromUnixTime(endDate));
  }

  @Patch('/end-premium/:studentId')
  async endPremium(@Param('studentId') studentId: number) {
    return await this.studentPlanService.endPremium(studentId);
  }

  @Patch('/convert-basic/:studentId')
  async convertBasic(@Param('studentId') studentId: number, @Query('studentCourseId') studentCourseId: number) {
    return await this.studentPlanService.convertBasic(studentId, studentCourseId);
  }

  @Patch('/add-premium-courses/:studentId')
  async addNewPremiumCourses(@Param('studentId') studentId: number) {
    return await this.studentPlanService.addNewPremiumCourses(studentId);
  }
}
