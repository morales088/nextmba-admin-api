import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly stripe: Stripe,
    private readonly webhookService: WebhookService
  ) {}

  @Post('/payment-success')
  async handleStripeWebhook(@Req() request: Request) {
    const signature = request.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = this.stripe.webhooks.constructEvent(request.body, signature, endpointSecret);
    } catch (err) {
      console.error(`⚠️  Webhook signature verification failed.`, err.message);
      return;
    }
    console.log("💡 ~ event:", event)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.webhookService.handleSuccessfulPayment(session);
    }

    return { received: true };
  }
}
