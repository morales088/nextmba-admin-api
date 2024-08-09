import { Injectable } from '@nestjs/common';
import { PaymentsService } from '../payments/services/payments.service';
import Stripe from 'stripe';

@Injectable()
export class WebhookService {
  constructor(private paymentService: PaymentsService) {}

  async handleEvent(event: Stripe.Event) {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.handleSuccessfulPayment(session);
    }
  }

  async handleSuccessfulPayment(session: Stripe.Checkout.Session) {
    const metaData = session.metadata;
    console.log('💡 ~ metaData:', metaData);

    const paymentData = {
      name: metaData.name,
      email: metaData.email,
      product_code: metaData.product_code,
      price: metaData.price,
    };

    return this.paymentService.createPayment(paymentData);
  }
}
