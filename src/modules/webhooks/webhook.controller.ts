import { Controller, Post, RawBodyRequest, Req } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { Request } from 'express';
import Stripe from 'stripe';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly stripe: Stripe,
    private readonly webhookService: WebhookService
  ) {}

  @Post('/payment-success')
  async handleStripeWebhook(@Req() request: RawBodyRequest<Request>) {
    const rawBody = request.rawBody;
    const signature = request.headers['stripe-signature'];
    console.log('💡 ~ signature:', signature);
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    console.log('💡 ~ endpointSecret:', endpointSecret);

    try {
      const event: Stripe.Event = this.stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
      await this.webhookService.handleEvent(event);
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed.`, err.message);
      return;
    }

    return { success: true, received: true };
  }
}
