import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { PaymentsModule } from '../payments/payments.module';
import { WebhookService } from './webhook.service';
import Stripe from 'stripe';

@Module({
  imports: [PaymentsModule],
  controllers: [WebhookController],
  providers: [WebhookService, Stripe],
  exports: [],
})
export class WebhookModule {}
