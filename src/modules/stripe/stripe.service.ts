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

    if (!subscriptionPayment) throw new NotFoundException('No subscription payment found.')

    return subscriptionPayment;
  }

  async updateSubscription(subscriptionId: string, metadata: any) {
    return this.stripe.subscriptions.update(subscriptionId, { metadata });
  }

  async findAndCancelSubscription(studentId: number) {
    const findSubscriptionPayment = await this.findSubscriptionPayment(studentId);

    if (findSubscriptionPayment?.product?.charge_type === ChargeType.RECURRING) {
      const { product, ...payment } = findSubscriptionPayment;

      // Step 1: Use Stripe's search functionality to find the active subscription with the provided metadata
      const query = `
        status:'active' 
        AND metadata['student_id']:'${studentId}' 
        AND metadata['student_email']:'${payment.id}'
        AND metadata['product_code']:'${product.code}'
      `;

      const subscriptions = await this.stripe.subscriptions.search({ query });
      console.log(`🔥 ~ subscriptions:`, subscriptions);

      if (subscriptions.data.length === 0) {
        throw new NotFoundException('No active subscription found for the given student');
      }

      const subscriptionId = subscriptions.data.at(0).id;
      console.log(`🔥 ~ subscriptionId:`, subscriptionId);

      return this.stripe.subscriptions.cancel(subscriptionId);
    }
  }
}
