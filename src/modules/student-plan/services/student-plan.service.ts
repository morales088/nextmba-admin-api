import { UTCDate } from '@date-fns/utc';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { addMonths, addWeeks } from 'date-fns';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { StripeService } from '../../stripe/stripe.service';
import { CourseTierStatus, StudentAccountType } from '../../../common/constants/enum';

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
  async activateTrial(studentId: number, startDate?: Date, endDate?: Date) {
    const trialClaimedAt = startDate ?? new UTCDate();
    const trialEndsAt = endDate ?? addWeeks(new UTCDate(), 1);

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
      expiration_date: trialEndsAt,
    }));

    // Update the student account type
    await this.database.students.update({
      where: { id: studentId },
      data: { account_type: 3, claimed_trial: true, claimed_trial_at: trialClaimedAt },
    });

    // Create courses
    const createdDatas = await Promise.all(
      insertData.map(async (data) => await this.database.student_courses.create({ data }))
    );

    return createdDatas;
  }

  // end trial
  async endTrial(studentId: number) {
    await this.stripeService.findAndCancelSubscription(studentId);

    // Update the student account to basic
    await this.database.students.update({ where: { id: studentId }, data: { account_type: 1 } });

    // Take all of the courses that came along with the trial
    const studentCourses = await this.database.student_courses.findMany({
      where: { student_id: studentId, course_tier: CourseTierStatus.TRIAL, status: 1 },
      select: { id: true },
    });

    // If there are courses to update, use a bulk update (updateMany)
    if (studentCourses.length > 0) {
      const studentCourseIds = studentCourses.map((sc) => sc.id);

      await this.database.student_courses.deleteMany({
        where: { id: { in: studentCourseIds } },
      });
    }
  }

  // activate subscription
  async activatePremium(studentId: number, activationDate: Date, expirationDate: Date) {
    // If student in the middle of trial, delete those course
    await this.database.student_courses.deleteMany({
      where: { student_id: studentId, status: 1, course_tier: CourseTierStatus.TRIAL },
    });

    // const studentData = await this.database.students.findFirst({ where: { id: studentId } });

    // Find all owned courses
    const studentCourses = await this.database.student_courses.findMany({
      where: { student_id: studentId, status: 1 },
      select: { course_id: true },
    });
    const courseIds = studentCourses.map((sc) => sc.course_id);

    // Fetch all unowned courses based on owned courses
    const unownedCourses = await this.database.courses.findMany({
      where: {
        status: 1,
        id: { notIn: courseIds },
      },
      select: { id: true, name: true, price: true, status: true },
    });

    // Set array of data for creating new student_courses
    const insertData = unownedCourses.map((course) => ({
      student_id: studentId,
      course_id: course.id,
      course_tier: CourseTierStatus.PREMIUM,
      expiration_date: expirationDate,
    }));

    // Update account type to premium
    await this.database.students.update({
      where: { id: studentId },
      data: { account_type: StudentAccountType.PREMIUM, last_premium_activation: activationDate },
    });

    // Create new student courses base on insertData
    const createdDatas = await Promise.all(
      insertData.map(async (data) => await this.database.student_courses.create({ data }))
    );

    return createdDatas;
  }

  async renewPremium(studentId: number, endDate: Date) {
    // Get inactive premium courses all current premium courses
    const premiumStudentCourses = await this.database.student_courses.findMany({
      where: { course_tier: 2, student_id: studentId, status: 0 },
      select: { id: true, course_id: true },
      distinct: ['course_id'],
    });
    const premiumStudentCourseIds = premiumStudentCourses.map((sc) => sc.id);

    // Update all premium courses at once
    const results = await this.database.student_courses.updateMany({
      where: { id: { in: premiumStudentCourseIds } },
      data: { expiration_date: endDate, status: 1 },
    });

    return results;
  }

  // end subscription
  async endPremium(studentId: number) {
    await this.stripeService.findAndCancelSubscription(studentId);
    await this.endPremiumCourses(studentId);
  }

  async endPremiumCourses(studentId: number) {
    // Update student account to basic
    await this.database.students.update({ where: { id: studentId }, data: { account_type: StudentAccountType.BASIC } });

    // Get all courses that came with premium
    const studentCourses = await this.database.student_courses.findMany({
      where: { student_id: studentId, course_tier: CourseTierStatus.PREMIUM, status: 1 },
      select: { id: true },
    });

    // Update all the courses so that the student doesn't have access to it
    if (studentCourses.length > 0) {
      const studentCourseIds = studentCourses.map((sc) => sc.id);

      const results = await this.database.student_courses.updateMany({
        where: { id: { in: studentCourseIds } },
        data: { status: 0 },
      });

      return results;
    }
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
