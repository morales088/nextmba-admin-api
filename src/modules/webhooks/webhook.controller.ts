import { Controller, Get, Post, RawBodyRequest, Req } from '@nestjs/common';
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
  // async handleStripeWebhook(@Req() request: RawBodyRequest<Request>) {
  async handleStripeWebhook(@Req() request: Request) {
    // const rawReqBody = request.rawBody;
    const reqBody = request.body;
    const signature = request.headers['stripe-signature'];
    // console.log("💡 ~ signature:", signature)
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    // console.log("💡 ~ endpointSecret:", endpointSecret)

    let event;

    try {
      event = this.stripe.webhooks.constructEvent(reqBody, signature, endpointSecret);
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed.`, err.message);
      return;
    }
    // console.log("💡 ~ event:", event)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("💡 ~ session:", session)
      await this.webhookService.handleSuccessfulPayment(session);
    }

    return { received: true };
  }
}
