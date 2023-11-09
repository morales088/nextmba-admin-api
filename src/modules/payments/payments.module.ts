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
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';
import { PaymentApiController } from './payment_api.controller';
import { StudentCoursesRepository } from '../students/repositories/student_courses.repository';
import { PaymentAffiliateRepository } from './repositories/payment_affiliate.repository';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentsController, PaymentApiController],
  providers: [
    PaymentsService,
    PaymentRepository,
    PaymentItemRepository,
    StudentRepository,
    ProductRepository,
    ProductItemRepository,
    StudentsService,
    HashService,
    ApiKeyGuard,
    StudentCoursesRepository,
    PaymentAffiliateRepository
  ],
})
export class PaymentsModule {}
