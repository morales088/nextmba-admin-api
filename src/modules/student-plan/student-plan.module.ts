import { Module } from '@nestjs/common';
import { StudentPlanController } from './student-plan.controller';
import { StudentPlanService } from './services/student-plan.service';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Module({
  controllers: [StudentPlanController],
  providers: [StudentPlanService, PrismaService],
  exports: [StudentPlanService],
})
export class StudentPlanModule {}
