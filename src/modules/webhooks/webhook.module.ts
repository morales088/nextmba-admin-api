import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { PaymentsModule } from '../payments/payments.module';
import { WebhookService } from './webhook.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { StripeModule } from '../stripe/stripe.module';
import { StudentPlanModule } from '../student-plan/student-plan.module';
import Stripe from 'stripe';

@Module({
  imports: [PaymentsModule, PrismaModule, StripeModule, StudentPlanModule],
  controllers: [WebhookController],
  providers: [WebhookService, Stripe],
  exports: [],
})
export class WebhookModule {}
