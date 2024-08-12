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
    const customerData = session.customer
    const customerEmail = session.customer_email
    const customerDetails = session.customer_details
    console.log("💡 ~ customerData:", customerData)
    console.log("💡 ~ customerDetails:", customerDetails)
    console.log('💡 ~ metaData:', metaData);

    const paymentData = {
      name: customerDetails.name,
      email: customerEmail,
      product_code: metaData.product_code,
      price: metaData.price,
    };
    console.log("💡 ~ paymentData:", paymentData)

    return this.paymentService.createPayment(paymentData);
  }
}
