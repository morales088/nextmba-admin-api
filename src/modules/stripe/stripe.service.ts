import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { CheckoutDataDTO } from './dto/stripe.dto';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-04-10',
    });
  }

  async createCheckoutSession(checkoutDataDto: CheckoutDataDTO): Promise<Stripe.Checkout.Session> {
    const { productName, price } = checkoutDataDto;

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
            },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: process.env.UPGRADE_SUCCESS_ROUTE,
      cancel_url: process.env.UPGRADE_CANCEL_ROUTE,
    });

    return session;
  }
}
