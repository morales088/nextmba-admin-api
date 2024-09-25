import { Module } from '@nestjs/common';
import { StudentSubscriptionsService } from './student-subscriptions.service';
import { StudentSubscriptionsController } from './student-subscriptions.controller';
import { StudentPlanModule } from '../student-plan/student-plan.module';

@Module({
  imports: [StudentPlanModule],
  controllers: [StudentSubscriptionsController],
  providers: [StudentSubscriptionsService],
  exports: [StudentSubscriptionsService],
})
export class StudentSubscriptionsModule {}
