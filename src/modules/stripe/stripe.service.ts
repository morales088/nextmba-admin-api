import { Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ChargeType } from '../../common/constants/enum';
import Stripe from 'stripe';

@Injectable()
@UseGuards(AuthGuard('jwt'))
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly database: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-04-10',
    });
  }

  async findCustomerByEmail(email: string) {
    const customers = await this.stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (customers.data.length > 0) {
      return customers.data[0];
    } else {
      return null;
    }
  }

  async findSubscription(studentId: number, productCode: string) {
    const student = await this.database.students.findUnique({
      where: { id: studentId },
      select: { id: true, email: true },
    });

    const customer = await this.findCustomerByEmail(student.email);
    if (!customer) return null;

    const subscriptions = await this.stripe.subscriptions.list({
      customer: customer.id,
    });

    const subscription = subscriptions.data.find((item) => {
      item.metadata.product_code === productCode;
    });

    console.log(`🔥 ~ Found subscription:`, subscription);
    return subscription;
  }

  async findSubscriptionPayment(studentId: number) {
    const subscriptionPayment = await this.database.payments.findFirst({
      where: {
        student_id: studentId,
        product: { charge_type: ChargeType.RECURRING },
        subscriptionId: { not: null },
      },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscriptionPayment) throw new NotFoundException('No subscription payment found.');

    console.log(`🔥 ~ subscriptionPayment:`, subscriptionPayment);

    return subscriptionPayment;
  }

  async retrieveSubscription(subscriptionId: string) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      // console.log(`🔥 ~ Retrieved Subscription:`, subscription);
      return subscription;
    } catch (error) {
      console.log(`Error occurred retrieving subscription`);
      return null;
    }
  }

  async updateSubscription(subscriptionId: string, metadata: any) {
    return this.stripe.subscriptions.update(subscriptionId, { metadata });
  }

  async findAndCancelSubscription(studentId: number) {
    const subscriptionPayment = await this.findSubscriptionPayment(studentId);
    console.log(`🔥 ~ subscriptionPayment:`, subscriptionPayment);

    return this.stripe.subscriptions.cancel(subscriptionPayment.subscriptionId);
  }

  async retrievePriceInfo(priceId: string) {
    return this.stripe.prices.retrieve(priceId);
  }
}
