import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './services/students.service';
import { StudentRepository } from './repositories/student.repository';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { HashService } from 'src/common/utils/hash.service';
import { PaymentRepository } from '../payments/repositories/payment.repository';
import { PaymentItemRepository } from '../payments/repositories/payment_item.repository';
import { StudentCoursesRepository } from './repositories/student_courses.repository';
import { SendMailService } from 'src/common/utils/send-mail.service';

@Module({
  imports: [PrismaModule],
  controllers: [StudentsController],
  providers: [
    StudentsService,
    StudentRepository,
    HashService,
    SendMailService,
    PaymentRepository,
    PaymentItemRepository,
    StudentCoursesRepository,
  ],
})
export class StudentsModule {}
