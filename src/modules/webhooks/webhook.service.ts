import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentsService } from '../payments/services/payments.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { SubscriptionStatus } from '../../common/constants/enum';
import { StudentPlanService } from '../student-plan/services/student-plan.service';
import Stripe from 'stripe';

@Injectable()
export class WebhookService {
  constructor(
    private readonly paymentService: PaymentsService,
    private readonly database: PrismaService,
    private readonly stripeService: StripeService,
    private readonly studentPlanService: StudentPlanService
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
    } else if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`🔥 ~ event.data.previous_attributes.status:`, event.data.previous_attributes.status);
      if (event.data.previous_attributes.status === SubscriptionStatus.TRIALING) {
        await this.handleUpdatedSubscription(subscription);
      } else if (event.data.previous_attributes.status === SubscriptionStatus.ACTIVE) {
        // check if the subscription is not paid
        // await this.handleUpdatedSubscription(subscription);
      }
    }
  }

  async handleUpdatedSubscription(subscription: Stripe.Subscription) {
    console.log(`🔥 ~ subscription:`, subscription);
    if (subscription.status === SubscriptionStatus.ACTIVE) {
      const metadata = subscription.metadata;
      console.log(`🔥 ~ metadata:`, metadata);

      const student = await this.database.students.findUnique({
        where: { id: parseInt(metadata.student_id), email: metadata.student_email },
      });

      if (!student) throw new NotFoundException('Student not found.');
      if (!metadata.product_code) throw new NotFoundException('Product code undefined.');

      const product = await this.database.products.findFirst({
        where: { code: metadata.product_code, status: 1 },
      });

      const paymentData = {
        name: student.name,
        email: metadata.student_email,
        product_code: product.code,
        price: product.price,
      };
      console.log(`🔥 ~ paymentData:`, paymentData);

      await this.studentPlanService.endTrial(student.id);
      await this.paymentService.createPayment(paymentData, subscription.status);
    }
  }

  async handleSuccessfulSubscription(session: Stripe.Checkout.Session) {
    try {
      const metaData = session.metadata;
      const productCode = metaData.product_code;
      const customerDetails = session.customer_details;
      const subscriptionId = session.subscription.toString();

      console.log(`🔥 ~ customerDetails:`, customerDetails);
      console.log(`🔥 ~ metaData:`, metaData);
      console.log(`🔥 ~ productCode:`, productCode);

      if (!productCode) throw new NotFoundException('Product code undefined.');

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

      // Access subscription object: check for status [trialing, active]
      const subscription = await this.stripeService.retrieveSubscription(subscriptionId);

      const payment = await this.paymentService.createPayment(paymentData, subscription.status);
      console.log(`🔥 ~ payment:`, payment);

      // Update subscription object of customer with metadata for later use
      await this.stripeService.updateSubscription(subscription.id, {
        payment_id: payment.id,
        student_id: payment.student_id,
        student_email: paymentData.email,
        product_code: paymentData.product_code,
      });
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
