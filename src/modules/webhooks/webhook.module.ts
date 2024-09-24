import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { PaymentsModule } from '../payments/payments.module';
import { WebhookService } from './webhook.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { StudentPlanService } from '../student-plan/services/student-plan.service';
import Stripe from 'stripe';

@Module({
  imports: [PaymentsModule, PrismaModule],
  controllers: [WebhookController],
  providers: [WebhookService, Stripe, StudentPlanService],
  exports: [],
})
export class WebhookModule {}
