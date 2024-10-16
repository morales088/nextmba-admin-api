import { Injectable } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Payment_items } from '@prisma/client';
import { CourseTierStatus, PaymentOrigin } from '../../../common/constants/enum';

@Injectable()
export class PaymentItemRepository extends AbstractRepository<Payment_items> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Payment_items'; // Specify the Prisma model name for entity
  }

  async find(id: number): Promise<Payment_items> {
    return this.prisma[this.modelName].findMany({
      where: { payment_id: id, status: 1 },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  async insert(studentId: number, paymentId: number, productCode: string, paymentOrigin: number = 1): Promise<any> {
    const product = await this.prisma.products.findFirst({
      where: { code: productCode, status: 1 },
      include: { product_items: { where: { status: 1 } } },
    });

    const productItems = product.product_items as unknown as {
      product_id: number;
      course_id: number;
      quantity: number;
      course_tier: number;
      status: number;
    }[];

    const currentDate = new Date();

    for (const product_item of productItems) {
      const studentCourse = await this.prisma.student_courses.findFirst({
        where: { student_id: studentId, course_id: product_item.course_id, status: 1 },
      });

      // if student has course or not expired
      const hasStudCourse = studentCourse && studentCourse.expiration_date > currentDate ? true : false;

      const giftable = hasStudCourse ? product_item.quantity : product_item.quantity - 1;

      // insert payment items
      const itemData = {
        payment_id: paymentId,
        course_id: product_item.course_id,
        quantity: product_item.quantity,
        giftable: giftable,
        course_tier: CourseTierStatus.PERMANENT,
      };

      const paymentItem = await this.prisma.payment_items.create({ data: itemData });

      const course = await this.prisma.courses.findFirst({
        where: { id: product_item.course_id },
      });

      const startingDate = paymentOrigin == PaymentOrigin.NextUni ? new Date() : new Date(course.starting_date);

      const expirationDate = new Date(startingDate);
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);

      const studentCourseData = {
        student_id: studentId,
        course_id: product_item.course_id,
        starting_date: startingDate,
        expiration_date: expirationDate,
        course_tier: CourseTierStatus.PERMANENT,
        is_followed: true,
      };

      // add student course for first time enrollee
      if (!studentCourse) await this.prisma.student_courses.create({ data: studentCourseData });

      // // update student course tier if not full access already
      // if (studentCourse && studentCourse?.course_tier !== CourseTierType.FULL) {
      //   await this.prisma.student_courses.update({
      //     where: { id: studentCourse.id },
      //     data: { course_tier: CourseTierType.FULL },
      //   });
      // }

      // update student course to expired course
      if (studentCourse && !hasStudCourse) {
        let newExpDate = new Date(studentCourse.expiration_date);
        newExpDate.setFullYear(newExpDate.getFullYear() + 1);

        const modulePerCourse = parseInt(process.env.MODULE_PER_COURSE);
        const newModuleQuantity = studentCourse.module_quantity + modulePerCourse;

        let newStudentCourseData: any = {
          expiration_date: newExpDate,
          module_quantity: newModuleQuantity,
          // course_tier: product_item.course_tier,
        };
        // if (product_item.course_tier == 1) newStudentCourseData.course_tier = product_item.course_tier;

        await this.prisma.student_courses.update({ where: { id: studentCourse.id }, data: newStudentCourseData });
      }
    }

    // insert all course if pro account
    // if (product.pro_access === true) await this.addPro(studentId);

    return 'payment items successfully created';
  }

  async findById(id: number) {
    return this.prisma[this.modelName].findUnique({ where: { id: id } });
  }

  async addPro(studentId: number) {
    const courses = await this.prisma.courses.findMany({ where: { status: 1, is_displayed: 1, paid: 1 } });
    const studCourses = await this.prisma.student_courses.findMany({ where: { student_id: studentId, status: 1 } });
    const latestDate = await this.prisma.student_courses.findFirst({
      where: { student_id: studentId, status: 1 },
      orderBy: [
        {
          id: 'desc',
        },
      ],
    });

    for (const course of courses) {
      const studentCourse = studCourses.find((studCourse) => studCourse.course_id === course.id);

      if (!studentCourse) {
        const date = latestDate.starting_date ?? course.starting_date;
        const startingDate = new Date(date);
        const expirationDate = new Date(startingDate);
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);
        const studentCourseData = {
          student_id: studentId,
          course_id: course.id,
          starting_date: startingDate,
          expiration_date: expirationDate,
        };

        await this.prisma.student_courses.create({ data: studentCourseData });
      }
    }
  }
}
