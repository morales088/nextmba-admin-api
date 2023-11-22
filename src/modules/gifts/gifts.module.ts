import { Module } from '@nestjs/common';
import { GiftsController } from './gifts.controller';
import { GiftsService } from './services/gifts.service';
import { GiftRepository } from './repositories/gift.repository';
import { PaymentRepository } from '../payments/repositories/payment.repository';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { PaymentItemRepository } from '../payments/repositories/payment_item.repository';
import { StudentRepository } from '../students/repositories/student.repository';
import { StudentsService } from '../students/services/students.service';
import { HashService } from 'src/common/utils/hash.service';
import { SendMailService } from 'src/common/utils/send-mail.service';
import { StudentCoursesRepository } from '../students/repositories/student_courses.repository';

@Module({
  imports: [PrismaModule],
  controllers: [GiftsController],
  providers: [
    GiftsService,
    GiftRepository,
    PaymentRepository,
    PaymentItemRepository,
    StudentRepository,
    StudentsService,
    HashService,
    SendMailService,
    StudentCoursesRepository,
  ],
})
export class GiftsModule {}
