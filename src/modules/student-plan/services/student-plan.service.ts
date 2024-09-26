import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class StudentPlanService {
  constructor(private readonly database: PrismaService) {}

  // end trial
  async endTrial(studentId: number) {
    return await this.database.$transaction(async (tx) => {
      await tx.students.update({ where: { id: studentId }, data: { account_type: 1 } });
      const studentCourse = await tx.student_courses.findMany({
        where: { student_id: studentId, course_tier: 3, status: 1 },
        select: { id: true },
      });

      const updatedDatas = await Promise.all(
        studentCourse.map(
          async (data) => await this.database.student_courses.update({ where: { id: data.id }, data: { status: 0 } })
        )
      );

      return updatedDatas;
    });
  }

  // activate subscription
  async activatePremium(studentId: number) {
    const studentData = await this.database.students.findFirst({ where: { id: studentId } });

    if (studentData.account_type === 2) return;

    const studentCourses = await this.database.student_courses.findMany({
      where: { student_id: studentId, status: 1 },
      select: { course_id: true },
    });
    const studentCourseIds = studentCourses.map((sc) => sc.course_id);

    const unownedCourses = await this.database.courses.findMany({
      where: {
        status: 1,
        id: { notIn: studentCourseIds },
      },
      select: { id: true, name: true, price: true, status: true },
    });

    const insertData = unownedCourses.map((course) => ({
      student_id: studentId,
      course_id: course.id,
      course_tier: 2,
    }));

    await this.database.students.update({
      where: { id: studentId },
      data: { account_type: 2, last_premium_activation: new Date() },
    });

    const createdDatas = await Promise.all(
      insertData.map(async (data) => await this.database.student_courses.create({ data }))
    );

    return createdDatas;
  }

  // end subscription
  async endPremium(studentId: number) {
    return await this.database.$transaction(async (tx) => {
      await tx.students.update({ where: { id: studentId }, data: { account_type: 1 } });

      const studentCourse = await tx.student_courses.findMany({
        where: { student_id: studentId, course_tier: 2, status: 1 },
        select: { id: true },
      });

      const updatedDatas = await Promise.all(
        studentCourse.map(
          async (data) => await this.database.student_courses.update({ where: { id: data.id }, data: { status: 0 } })
        )
      );

      return updatedDatas;
    });
  }
}
