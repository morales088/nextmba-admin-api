import { Controller, Param, Patch, Post } from '@nestjs/common';
import { StudentPlanService } from './services/student-plan.service';

@Controller('student-plan')
export class StudentPlanController {
  constructor(private readonly studentPlanService: StudentPlanService) {}

  @Patch('/end-trial/:studentId')
  async endTrial(@Param('studentId') studentId: number) {
    return await this.studentPlanService.endTrial(studentId);
  }

  @Post('/activate-premium/:studentId')
  async activatePremium(@Param('studentId') studentId: number) {
    return await this.studentPlanService.activatePremium(studentId);
  }

  @Patch('/end-premium/:studentId')
  async endPremium(@Param('studentId') studentId: number) {
    return await this.studentPlanService.endPremium(studentId);
  }
}
