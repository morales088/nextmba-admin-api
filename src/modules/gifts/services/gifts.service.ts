import { Injectable } from '@nestjs/common';
import { GiftRepository } from '../repositories/gift.repository';
import { PaymentRepository } from 'src/modules/payments/repositories/payment.repository';
import { StudentRepository } from 'src/modules/students/repositories/student.repository';
import { CreateGiftDto } from '../dto/gift.dto';
import { StudentsService } from 'src/modules/students/services/students.service';
import { StudentCoursesRepository } from 'src/modules/students/repositories/student_courses.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { SendMailService } from 'src/common/utils/send-mail.service';

@Injectable()
export class GiftsService {
  constructor(
    protected readonly prisma: PrismaService,
    private readonly giftRepository: GiftRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly studentRepository: StudentRepository,
    private readonly studentsService: StudentsService,
    private readonly studentCoursesRepository: StudentCoursesRepository,
    private readonly sendMailService: SendMailService,
  ) {}

  async getGiftable(studentId: number) {
    const paymentItem = await this.paymentRepository.getGiftable(studentId);
    for (const item of paymentItem) {
      const gift = await this.giftRepository.getGift(item.payment_id, item.course_id);
      console.log(gift);
      item.recipient = gift
    }

    return paymentItem;
  }

  async sendCourse(data: CreateGiftDto) {
    const findStudent = await this.studentRepository.findByEmail(data.recipient);
    const studentCourse = findStudent?.student_courses?.find((res) => res.course_id === data.course_id);

    const paymentItems = await this.paymentRepository.getGiftable(data.student_id);
    const paymentItem = paymentItems.find(
      (res) => res.payment_id === data.payment_id && res.course_id === data.course_id
    );
    console.log(paymentItem)
    if (!paymentItem || paymentItem.giftable < 1 || studentCourse)
      return { message: 'zero courses available / recipient already has this course / course expired' };

    const gift = this.prisma.$transaction(async (prisma) => {
      // check if email has account and return student_id
      let studentId: number;
      if (findStudent) {
        studentId = findStudent.id;
      } else {
        // create student
        var name = data.recipient.split('@')[0];
        const studentData = {
          name: name,
          email: data.recipient,
        };

        const createStudent = await this.studentsService.createStudent(studentData);

        studentId = createStudent.id;
      }

      // insert student course
      const studentCourseData = {
        student_id: studentId,
        course_id: data.course_id,
        course_type: 3,
      };
      await this.studentCoursesRepository.insert(studentCourseData);

      // insert gift
      const giftData = {
        from_student_id: data.student_id,
        payment_id: data.payment_id,
        course_id: data.course_id,
        recipient: data.recipient,
      };
      const gift = await this.giftRepository.insert(giftData);

      // deduct course to payment
      await this.prisma.payment_items.update({
        where: { id: paymentItem.id },
        data: { giftable: --paymentItem.giftable },
      });

      // send gift email notification
      if (gift) {
        this.sendMailService.emailGiftInformation(data.recipient, name, paymentItem.course_name);
      }

    });

    return { message: 'Gift successfully sent.' };
  }
}
