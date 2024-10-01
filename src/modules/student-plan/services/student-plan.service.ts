import { UTCDate } from '@date-fns/utc';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { addMonths, addWeeks } from 'date-fns';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { StripeService } from '../../stripe/stripe.service';

@Injectable()
export class StudentPlanService {
  constructor(
    private readonly database: PrismaService,
    private readonly stripeService: StripeService
  ) {}

  async findSubscriptionDetails(studentId: number) {
    const student = await this.database.students.findFirst({ where: { id: studentId } });

    if (student?.account_type !== 2) return {};

    const { product } = await this.stripeService.findSubscriptionPayment(studentId);

    return {
      name: product.name,
      code: product.code,
      price: product.price,
    };
  }

  // start trial
  async activateTrial(studentId: number) {
    // Get the student data
    const studentData = await this.database.students.findFirst({ where: { id: studentId } });

    if (studentData.claimed_trial) return new ForbiddenException('Student already claimed trial');

    // Create an array of owned courses
    const studentCourses = await this.database.student_courses.findMany({
      where: { student_id: studentId, status: 1 },
      select: { course_id: true },
    });
    const studentCourseIds = studentCourses.map((sc) => sc.course_id);

    // Finds the courses that is unowned
    const unownedCourses = await this.database.courses.findMany({
      where: {
        status: 1,
        id: { notIn: studentCourseIds },
      },
    });

    // Create data for creating student courses
    const insertData = unownedCourses.map((course) => ({
      student_id: studentId,
      course_id: course.id,
      course_tier: 3,
      expiration_date: addWeeks(new UTCDate(), 1),
    }));

    // Update the student account type
    await this.database.students.update({
      where: { id: studentId },
      data: { account_type: 3, claimed_trial: true, claimed_trial_at: new UTCDate() },
    });

    // Create courses
    const createdDatas = await Promise.all(
      insertData.map(async (data) => await this.database.student_courses.create({ data }))
    );

    return createdDatas;
  }

  // end trial
  async endTrial(studentId: number) {
    return await this.database.$transaction(async (tx) => {
      // Update the student account to basic
      await tx.students.update({ where: { id: studentId }, data: { account_type: 1 } });

      // Take all of the courses that came along with the trial
      const studentCourse = await tx.student_courses.findMany({
        where: { student_id: studentId, course_tier: 3, status: 1 },
        select: { id: true },
      });

      // Update the data
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

    // Find all owned courses
    const studentCourses = await this.database.student_courses.findMany({
      where: { student_id: studentId, status: 1 },
      select: { course_id: true },
    });
    const studentCourseIds = studentCourses.map((sc) => sc.course_id);

    // Fetch all unowned courses based on owned courses
    const unownedCourses = await this.database.courses.findMany({
      where: {
        status: 1,
        id: { notIn: studentCourseIds },
      },
      select: { id: true, name: true, price: true, status: true },
    });

    // Set array of data for creating new student_courses
    const insertData = unownedCourses.map((course) => ({
      student_id: studentId,
      course_id: course.id,
      course_tier: 2,
      expiration_date: addMonths(new UTCDate(), 1),
    }));

    // Update account type to premium
    await this.database.students.update({
      where: { id: studentId },
      data: { account_type: 2, last_premium_activation: new Date() },
    });

    // If student in the middle of trial, set those course to 0
    await this.database.student_courses.updateMany({
      where: { student_id: studentId, status: 1, course_tier: 3 },
      data: { status: 0 },
    });

    // Create new student courses base on insertData
    const createdDatas = await Promise.all(
      insertData.map(async (data) => await this.database.student_courses.create({ data }))
    );

    return createdDatas;
  }

  async renewPremium(studentId: number) {
    return await this.database.$transaction(async (tx) => {
      // Get all current premium courses
      const premiumCourses = await tx.student_courses.findMany({
        where: { course_tier: 2, student_id: studentId, status: 1 },
        select: { id: true },
      });
      const premiumCoursesIds = premiumCourses.map((pc) => pc.id);

      // Update all premium coures
      const updatedDatas = await Promise.all(
        premiumCoursesIds.map(
          async (courseId) =>
            await tx.student_courses.update({
              where: { id: courseId },
              data: { expiration_date: addMonths(new UTCDate(), 1) },
            })
        )
      );

      return updatedDatas;
    });
  }

  // end subscription
  async endPremium(studentId: number) {
    await this.stripeService.findAndCancelSubscription(studentId);

    return await this.database.$transaction(async (tx) => {
      // Update student account to basic
      await tx.students.update({ where: { id: studentId }, data: { account_type: 1 } });

      // Get all courses that came with premium
      const studentCourse = await tx.student_courses.findMany({
        where: { student_id: studentId, course_tier: 2, status: 1 },
        select: { id: true },
      });

      // Update all the courses so that the student doesn't have access to it
      const updatedDatas = await Promise.all(
        studentCourse.map(
          async (data) => await this.database.student_courses.update({ where: { id: data.id }, data: { status: 0 } })
        )
      );

      return updatedDatas;
    });
  }

  // Used for tracking expired basic courses (exceeded 1 year expiration)
  async convertBasic(studentId: number, studentCourseId: number) {
    await this.database.$transaction(async (tx) => {
      const { account_type } = await tx.students.findUnique({ where: { id: studentId } });
      const { expiration_date } = await tx.student_courses.findFirst({
        where: { student_id: studentId, status: 1 },
        select: { expiration_date: true },
        orderBy: { id: 'asc' },
      });

      if (account_type === 2) {
        return await tx.student_courses.update({
          where: { id: studentCourseId, course_tier: 1, status: 1 },
          data: { course_tier: 2, expiration_date },
        });
      }

      return await tx.student_courses.update({
        where: { id: studentCourseId, course_tier: 1, status: 1 },
        data: { status: 0 },
      });
    });
  }

  // For adding new courses that wasn't added before getting a premium plan
  async addNewPremiumCourses(studentId: number) {
    // Find all owned courses
    const studentCourses = await this.database.student_courses.findMany({
      where: { student_id: studentId, status: { in: [1, 2] } },
      select: { course_id: true },
    });
    const studentCourseIds = studentCourses.map((sc) => sc.course_id);

    // Get current expiration date of courses
    const { expiration_date } = await this.database.student_courses.findFirst({
      where: { student_id: studentId, status: 1 },
      select: { expiration_date: true },
      orderBy: { id: 'asc' },
    });

    // Fetch all unowned courses based on owned courses
    const unownedCourses = await this.database.courses.findMany({
      where: {
        status: 1,
        id: { notIn: studentCourseIds },
      },
    });

    // Set array of data for creating new student_courses
    const insertData = unownedCourses.map((course) => ({
      student_id: studentId,
      course_id: course.id,
      course_tier: 2,
      expiration_date: expiration_date,
    }));

    // Create new student courses base on insertData
    const createdDatas = await Promise.all(
      insertData.map(async (data) => await this.database.student_courses.create({ data }))
    );
  }
}
