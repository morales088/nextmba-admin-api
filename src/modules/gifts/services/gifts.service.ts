import { Injectable } from '@nestjs/common';
import { GiftRepository } from '../repositories/gift.repository';
import { PaymentRepository } from 'src/modules/payments/repositories/payment.repository';
import { StudentRepository } from 'src/modules/students/repositories/student.repository';
import { CreateGiftDto } from '../dto/create-gift.dto';
import { StudentsService } from 'src/modules/students/services/students.service';
import { StudentCoursesRepository } from 'src/modules/students/repositories/student_courses.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { SendMailService } from 'src/common/utils/send-mail.service';
import { CourseRepository } from 'src/modules/courses/repositories/course.repository';

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
    private readonly courseRepository: CourseRepository
  ) {}

  async getGiftable(studentId: number) {
    const paymentItem = await this.paymentRepository.getGiftable(studentId);

    let courseIds = [];
    for (const item of paymentItem) {
      const gift = await this.giftRepository.getGift(item.payment_id, item.course_id);

      // add owner email if course is first avail
      if (!courseIds.includes(item.course_id)) {
        courseIds.push(item.course_id);
        gift.unshift({ recipient: item.owner });
      }

      item.recipient = gift;

      item.gift_quantity = item.giftable + item.recipient.length;
    }

    return paymentItem;
  }

  async sendCourse(data: CreateGiftDto) {
    const giftableDate = new Date(process.env.GIFTABLE_DATE);
    const findStudent = await this.studentRepository.findByEmail(data.recipient);
    const studentCourse = findStudent?.student_courses?.find((res) => res.course_id === data.course_id);

    const paymentItems = await this.paymentRepository.getGiftable(data.student_id);
    const paymentItem = paymentItems.find(
      (res) => res.payment_id === data.payment_id && res.course_id === data.course_id
    );

    // if (!paymentItem || paymentItem.giftable < 1 || studentCourse || paymentItem.createdAt <= giftableDate)
    //   return { code: 422, message: 'zero courses available / recipient already has this course / course expired' };

    if (!paymentItem || paymentItem.giftable < 1)
      return { code: 422, message: 'zero courses available' };

    if (studentCourse)
      return { code: 422, message: 'recipient already has this course' };

    if (paymentItem.createdAt <= giftableDate)
      return { code: 422, message: `Cannot gift course bought below ${giftableDate}` };

    console.log(data.recipient)

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
          library_access: 1,
        };

        const createStudent = await this.studentsService.createStudentTx(studentData);

        studentId = createStudent.id;
      }
      
      const course = await this.courseRepository.findById(data.course_id);

      // insert student course
      const startingDate = new Date(course.starting_date);

      // switch (data.course_id) {
      //   // Marketing course
      //   case 1:
      //     startingDate.setDate(3);
      //     break;

      //   // Executive Course
      //   case 2:
      //     startingDate.setDate(5);
      //     break;

      //   // Tracy Mastermind
      //   case 6:
      //     startingDate.setDate(17);
      //     break;

      //   // Technology Course
      //   case 7:
      //     startingDate.setDate(10);
      //     break;
      // }

      const expirationDate = new Date(startingDate);
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);

      const studentCourseData = {
        student_id: studentId,
        course_id: data.course_id,
        course_type: 3,
        starting_date: startingDate,
        expiration_date: expirationDate,
        course_tier : paymentItem.course_tier
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

    return { code: 200, message: 'Gift successfully sent.' };
  }

  async updateGift(id: number, data) {
    // get recipient data
    const gifts = await this.getGiftable(data.student_id);
    const recipient = gifts.filter((gift) => gift.payment_id === data.payment_id);
    const newGiftable = data.quantity - recipient[0].recipient.length;

    const giftable = {
      quantity: newGiftable,
    };
    return this.giftRepository.updateGift(id, giftable);
  }

  async getCourse(id: number) {
    return this.courseRepository.findById(id);
  }
}
