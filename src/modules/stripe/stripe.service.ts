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

  async findSubscriptionPayment(studentId: number) {
    const subscriptionPayment = await this.database.payments.findFirst({
      where: {
        student_id: studentId,
        product: { charge_type: ChargeType.RECURRING },
      },
      include: { product: true },
    });

    if (!subscriptionPayment) throw new NotFoundException('No subscription payment found.');

    return subscriptionPayment;
  }

  async retrieveSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }

  async updateSubscription(subscriptionId: string, metadata: any) {
    return this.stripe.subscriptions.update(subscriptionId, { metadata });
  }

  async findAndCancelSubscription(studentId: number) {
    const subscriptionPayment = await this.findSubscriptionPayment(studentId);

    return this.stripe.subscriptions.cancel(subscriptionPayment.subscriptionId);
  }
}
