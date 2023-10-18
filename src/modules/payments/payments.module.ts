import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './services/payments.service';
import { PaymentRepository } from './repositories/payment.repository';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { PaymentItemRepository } from './repositories/payment_item.repository';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentRepository, PaymentItemRepository]
})
export class PaymentsModule {}
