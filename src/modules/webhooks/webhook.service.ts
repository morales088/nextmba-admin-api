import { Injectable } from '@nestjs/common';
import { PaymentsService } from '../payments/services/payments.service';
import Stripe from 'stripe';

@Injectable()
export class WebhookService {
  constructor(
    private readonly stripe: Stripe,
    private paymentService: PaymentsService
  ) {}

  async handleEvent(event: Stripe.Event) {
    console.log(`🔥 ~ event:`, event);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.mode === 'payment') {
        await this.handleSuccessfulPayment(session);
      } else if (session.mode === 'subscription') {
        await this.handleSuccessfulSubscription(session);
      }
    }

    // In 'checkout.session.completed' handle the
    // mode 'subscription'
    // access the metadata that includes the product_code from payment link
    // use that product code determine the product bought by the user

    // create a new handleSuccessPayment for subscription
    // use the product_code from the meta data to fetch the product in the web app
    // use the price from the product and use to create payment
  }

  async handleSuccessfulSubscription(session: Stripe.Checkout.Session) {
    console.log(`🔥 ~ session.line_items:`, session.line_items);
    const metaData = session.metadata;
    console.log(`🔥 ~ metaData:`, metaData);
    const customerDetails = session.customer_details;
    console.log(`🔥 ~ customerDetails:`, customerDetails);

    const lineItems = await this.stripe.checkout.sessions.listLineItems(session.id);
    console.log(`🔥 ~ lineItems:`, lineItems);

    const paymentData = {
      name: customerDetails.name,
      email: customerDetails.email,
      product_code: metaData.product_code,
      price: metaData.price,
    };
    console.log('💡 ~ paymentData:', paymentData);

    // return this.paymentService.createPayment(paymentData);
  }

  async handleSuccessfulPayment(session: Stripe.Checkout.Session) {
    const metaData = session.metadata;
    const customerDetails = session.customer_details;

    const paymentData = {
      name: customerDetails.name,
      email: customerDetails.email,
      product_code: metaData.product_code,
      price: metaData.price,
    };
    console.log('💡 ~ paymentData:', paymentData);

    return this.paymentService.createPayment(paymentData);
  }
}
