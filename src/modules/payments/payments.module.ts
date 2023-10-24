import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './services/payments.service';
import { PaymentRepository } from './repositories/payment.repository';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { PaymentItemRepository } from './repositories/payment_item.repository';
import { StudentRepository } from '../students/repositories/student.repository';
import { StudentsService } from '../students/services/students.service';
import { HashService } from 'src/common/utils/hash.service';
import { ProductRepository } from '../products/repositories/product.repository';
import { ProductItemRepository } from '../products/repositories/product_item.repository';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentRepository,
    PaymentItemRepository,
    StudentRepository,
    ProductRepository,
    ProductItemRepository,
    StudentsService,
    HashService,
  ],
})
export class PaymentsModule {}
