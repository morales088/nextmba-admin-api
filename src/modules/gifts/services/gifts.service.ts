import { Injectable } from '@nestjs/common';
import { GiftRepository } from '../repositories/gift.repository';
import { PaymentRepository } from 'src/modules/payments/repositories/payment.repository';

@Injectable()
export class GiftsService {
    constructor(
      private readonly giftRepository: GiftRepository,
      private readonly paymentRepository: PaymentRepository
    ) {}
    
  async getGiftable(studentId: number) {
    const paymentItem = await this.paymentRepository.getGiftable(studentId);
    for (const item of paymentItem){
        const gift = await this.giftRepository.getGift(item.payment_id, item.course_id);
        console.log(gift)
    }

    return paymentItem;
  }
}
