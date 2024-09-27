import { Injectable } from '@nestjs/common';
import { PaymentsService } from '../payments/services/payments.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import Stripe from 'stripe';

@Injectable()
export class WebhookService {
  constructor(
    private readonly paymentService: PaymentsService,
    private readonly database: PrismaService,
    private readonly stripeService: StripeService
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
  }

  async handleSuccessfulSubscription(session: Stripe.Checkout.Session) {
    try {
      const metaData = session.metadata;
      console.log(`🔥 ~ metaData:`, metaData);
      const customerDetails = session.customer_details;
      console.log(`🔥 ~ customerDetails:`, customerDetails);
      const productCode = metaData.product_code;
      console.log(`🔥 ~ metaData.product_code:`, metaData.product_code);
      console.log(`🔥 ~ productCode:`, productCode);

      const product = await this.database.products.findFirst({
        where: { code: productCode, status: 1 },
      });

      const paymentData = {
        name: customerDetails.name,
        email: customerDetails.email,
        product_code: product.code,
        price: product.price,
      };
      console.log('💡 ~ paymentData:', paymentData);

      const payment = await this.paymentService.createPayment(paymentData);
      console.log(`🔥 ~ payment:`, payment);

      const subscription = await this.stripeService.updateSubscription(session.subscription.toString(), {
        student_id: payment.student_id,
        payment_id: payment.id,
        product_code: paymentData.product_code,
      });
      console.log(`🔥 ~ subscription:`, subscription);
    } catch (error) {
      console.error('Error occurred: ', error.message);
    }
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
