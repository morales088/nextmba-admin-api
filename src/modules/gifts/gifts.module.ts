import { Module } from '@nestjs/common';
import { GiftsController } from './gifts.controller';
import { GiftsService } from './services/gifts.service';
import { GiftRepository } from './repositories/gift.repository';
import { PaymentRepository } from '../payments/repositories/payment.repository';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { PaymentItemRepository } from '../payments/repositories/payment_item.repository';

@Module({
  imports: [PrismaModule],
  controllers: [GiftsController],
  providers: [GiftsService, GiftRepository, PaymentRepository, PaymentItemRepository]
})
export class GiftsModule {}
