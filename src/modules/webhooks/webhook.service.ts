import { Injectable } from '@nestjs/common';
import { PaymentsService } from '../payments/services/payments.service';
import Stripe from 'stripe';

@Injectable()
export class WebhookService {
  constructor(private paymentService: PaymentsService) {}

  async handleSuccessfulPayment(session: Stripe.Checkout.Session) {
    const metaData = session.metadata;

    const paymentData = {
      name: metaData.email,
      email: metaData.email,
      product_code: metaData.product_code,
      price: metaData.price,
    };

    const payment = await this.paymentService.createPayment(paymentData);
    console.log("💡 ~ payment:", payment)
  }
}
