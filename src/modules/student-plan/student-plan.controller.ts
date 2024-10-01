import { Controller, Param, Patch, Post, Query, Get } from '@nestjs/common';
import { StudentPlanService } from './services/student-plan.service';

@Controller('student-plan')
export class StudentPlanController {
  constructor(private readonly studentPlanService: StudentPlanService) {}

  @Get('/:studentId')
  async getSubscriptionDetails(@Param('studentId') studentId: number) {
    return await this.studentPlanService.findSubscriptionDetails(studentId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/activate-trial')
  async activateTrial(@Auth('userId') studentId: number) {
    return await this.studentPlanService.activateTrial(studentId);
  }

  @Patch('/end-trial/:studentId')
  async endTrial(@Param('studentId') studentId: number) {
    return await this.studentPlanService.endTrial(studentId);
  }

  @Post('/activate-premium/:studentId')
  async activatePremium(@Param('studentId') studentId: number) {
    return await this.studentPlanService.activatePremium(studentId);
  }

  @Patch('/renew-premium/:studentId')
  async renewPremium(@Param('studentId') studentId: number) {
    return await this.studentPlanService.renewPremium(studentId);
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
