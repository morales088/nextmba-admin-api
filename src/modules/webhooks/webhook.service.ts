import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PaymentsService } from '../payments/services/payments.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { SubscriptionStatus } from '../../common/constants/enum';
import { StudentPlanService } from '../student-plan/services/student-plan.service';
import Stripe from 'stripe';
import { fromUnixTime } from 'date-fns';

@Injectable()
export class WebhookService {
  constructor(
    private readonly paymentService: PaymentsService,
    private readonly database: PrismaService,
    private readonly stripeService: StripeService,
    private readonly studentPlanService: StudentPlanService
  ) {}

  async handleEvent(event: Stripe.Event) {
    console.log('');
    console.log(`🔥 ~ Event:`, event.data.object);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.mode === 'payment') {
        await this.handleSuccessfulPayment(session);
      } else if (session.mode === 'subscription') {
        await this.handleSuccessfulSubscription(session);
      } else {
        throw new BadRequestException('Invalid mode of payment.');
      }
    } else if (event.type === 'customer.subscription.updated') {
      console.log('');
      console.log('Customer update event');
      const subscription = event.data.object as Stripe.Subscription;
      const prevAttributes = event.data.previous_attributes;

      if (prevAttributes?.status === SubscriptionStatus.INCOMPLETE) return;

      console.log(`🔥 ~ prevAttributes:`, prevAttributes);
      console.log(`${subscription.id} prev status: [${prevAttributes.status}] updated to: [${subscription.status}]`);

      if (prevAttributes?.status === SubscriptionStatus.TRIALING) {
        await this.handleTrialToActiveSubscription(subscription);
      } else if (prevAttributes?.status === SubscriptionStatus.ACTIVE) {
        await this.handlePastDueAndCanceledSubscription(subscription);
      } else {
        await this.handleOtherStatusesToActiveSubscription(subscription);
      }
    }
  }

  async handleOtherStatusesToActiveSubscription(subscription: Stripe.Subscription) {
    if (subscription.status === SubscriptionStatus.ACTIVE) {
      const subscriptionPayment = await this.database.payments.findFirst({
        where: { subscriptionId: subscription.id },
      });

      const student = await this.database.students.findUnique({
        where: { id: subscriptionPayment.student_id },
      });

      if (!student) throw new NotFoundException('Student not found.');

      await this.studentPlanService.renewPremium(student.id, fromUnixTime(subscription.current_period_end));
    }
  }

  async handlePastDueAndCanceledSubscription(subscription: Stripe.Subscription) {
    if (subscription.status === SubscriptionStatus.PAST_DUE || SubscriptionStatus.CANCELLED) {
      const subscriptionPayment = await this.database.payments.findFirst({
        where: { subscriptionId: subscription.id },
      });

      const student = await this.database.students.findUnique({
        where: { id: subscriptionPayment.student_id },
      });

      if (!student) throw new NotFoundException('Student not found.');

      await this.studentPlanService.endPremiumCourses(student.id);
    }
  }

  async handleTrialToActiveSubscription(subscription: Stripe.Subscription) {
    if (subscription.status === SubscriptionStatus.ACTIVE) {
      const subscriptionPayment = await this.database.payments.findFirst({
        where: { subscriptionId: subscription.id },
        include: { product: true },
      });

      const student = await this.database.students.findUnique({
        where: { id: subscriptionPayment.student_id },
      });
      if (!student) throw new NotFoundException('Student not found.');

      const product = await this.database.products.findFirst({
        where: { code: subscriptionPayment.product.code, status: 1 },
      });
      if (!product) throw new NotFoundException('Product not found.');

      const paymentData = {
        name: student.name,
        email: student.email,
        product_code: product.code,
        price: product.price,
        subscriptionId: subscription.id,
      };

      await this.paymentService.createPayment(paymentData);
    }
  }

  async handleSuccessfulSubscription(session: Stripe.Checkout.Session) {
    try {
      const metaData = session.metadata;
      const productCode = metaData.product_code;
      const customerDetails = session.customer_details;
      const subscriptionId = session.subscription.toString();

      console.log(`Mode: ${session.mode}`);
      console.log('Customer Details', JSON.stringify(customerDetails, null, 2));
      console.log('Metadata', JSON.stringify(metaData, null, 2));

      if (!productCode) throw new NotFoundException('Product code undefined.');
      const product = await this.database.products.findFirst({ where: { code: productCode, status: 1 } });

      const subscription = await this.stripeService.retrieveSubscription(subscriptionId);
      console.log(`🔥 ~ subscription:`, subscription);

      const paymentData = {
        name: customerDetails.name,
        email: customerDetails.email,
        subscriptionId: subscription.id,
        product_code: product.code,
        price: subscription.status === SubscriptionStatus.TRIALING ? 0 : product.price,
      };

      console.log('Payment Data', JSON.stringify(paymentData, null, 2));

      await this.paymentService.createPayment(paymentData);
    } catch (error) {
      console.error('Error occurred handleSuccessfulSubscription: ');
      console.error('Error occurred: ', error);
    }
  }

  async handleSuccessfulPayment(session: Stripe.Checkout.Session) {
    const metaData = session.metadata;
    const customerDetails = session.customer_details;
    const customFields = session.custom_fields || [];

    // Get the value of the name field, if it exists
    const nameField = customFields.find((field) => field.key === 'name');
    const customerName = nameField?.text?.value || customerDetails.name;

    if (!metaData.product_code) throw new NotFoundException('Product code undefined.');

    const product = await this.database.products.findFirst({ where: { code: metaData.product_code, status: 1 } });

    if (metaData && Object.keys(metaData).length > 0) {
      const amountTotal = session.amount_total / 100;

      const paymentData = {
        name: customerName,
        email: customerDetails.email,
        product_code: product.code,
        price: amountTotal ?? product.price,
        ...(metaData.affiliate_code != null && { affiliate_code: metaData.affiliate_code })
      };

      console.log(`Mode: ${session.mode}`);
      console.log('Payment Data', JSON.stringify(paymentData, null, 2));

      return this.paymentService.createPayment(paymentData);
    }
  }
}
