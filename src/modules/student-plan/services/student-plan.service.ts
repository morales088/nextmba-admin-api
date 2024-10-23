import { UTCDate } from '@date-fns/utc';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { addWeeks, fromUnixTime } from 'date-fns';
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

    const { product, subscriptionId } = await this.stripeService.findSubscriptionPayment(studentId);
    const subscription = await this.stripeService.retrieveSubscription(subscriptionId);

    return {
      name: product.name,
      code: product.code,
      price: product.price,
      start_date: fromUnixTime(subscription.start_date),
      next_payment_date: fromUnixTime(subscription.current_period_end),
    };
  }

  // Start trial subscription
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
        paid: 1,
        is_displayed: 1,
        id: { notIn: studentCourseIds },
      },
    });

    // Create data for creating student courses
    const newTrialCourses = unownedCourses.map((course) => ({
      student_id: studentId,
      course_id: course.id,
      course_tier: CourseTierStatus.TRIAL,
      expiration_date: trialEndsAt,
    }));

    const [createdTrialCourses, updatedStudent] = await Promise.all([
      // Create new trial course access entries
      this.database.student_courses.createMany({ data: newTrialCourses }),

      // Update the student account details
      this.database.students.update({
        where: { id: studentId },
        data: {
          account_type: StudentAccountType.TRIAL,
          claimed_trial: true,
          claimed_trial_at: trialClaimedAt,
        },
      }),
    ]);

    return createdTrialCourses;
  }

  // Converts expired student courses to trial courses
  async convertExpiredToTrialCourses(studentId: number) {
    // Find all expired permanent courses
    const expiredCourses = await this.database.student_courses.findMany({
      where: {
        student_id: studentId,
        course_tier: CourseTierStatus.PERMANENT,
        expiration_date: {
          lte: new UTCDate(),
        },
        status: 0,
      },
      select: { id: true, course_id: true },
    });

    if (expiredCourses.length === 0) return;

    for (const expiredCourse of expiredCourses) {
      // Ensure expired course is deactivated temporarily
      await this.database.student_courses.update({
        where: { id: expiredCourse.id },
        data: { status: 0 },
      });

      // Create trial tier equivalent
      await this.database.student_courses.create({
        data: {
          student_id: studentId,
          course_id: expiredCourse.course_id,
          course_tier: CourseTierStatus.TRIAL,
        },
      });
    }
  }

  // End trial subscription
  async endTrial(studentId: number) {
    await this.stripeService.findAndCancelSubscription(studentId);

    const [updatedStudent, deletedTrialCourses, expiredStudPermanentCourses] = await Promise.all([
      // Update the student account to basic
      this.database.students.update({ where: { id: studentId }, data: { account_type: StudentAccountType.BASIC } }),

      // Remove all trial courses
      this.database.student_courses.deleteMany({
        where: { student_id: studentId, course_tier: CourseTierStatus.TRIAL, status: 1 },
      }),

      // Find all expired permanent courses that were previously deactivated
      this.database.student_courses.findMany({
        where: {
          student_id: studentId,
          course_tier: CourseTierStatus.PERMANENT,
          expiration_date: {
            not: null,
            lte: new UTCDate(),
          },
          status: 0,
        },
        distinct: ['course_id'],
        select: { id: true, course_id: true },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    if (expiredStudPermanentCourses.length > 0) {
      const expiredStudCourseIds = expiredStudPermanentCourses.map((course) => course.id);

      // Reactivate expired permanent courses for visibility
      await this.database.student_courses.updateMany({
        where: {
          id: { in: expiredStudCourseIds },
          student_id: studentId,
        },
        data: { status: 1 },
      });
    }
  }

  // Activate subscription
  async activatePremium(studentId: number, activationDate: Date, expirationDate: Date) {
    const [currentCourses, deletedTrialCourses] = await Promise.all([
      // Find all owned courses
      this.database.student_courses.findMany({
        where: { student_id: studentId, status: 1 },
        select: { course_id: true },
      }),

      // Remove trial courses
      this.database.student_courses.deleteMany({
        where: {
          student_id: studentId,
          course_tier: CourseTierStatus.TRIAL,
          status: 1,
        },
      }),
    ]);

    const courseIds = currentCourses.map((sc) => sc.course_id);

    // Get all available premium courses not owned by student
    const unownedCourses = await this.database.courses.findMany({
      where: {
        id: { notIn: courseIds },
        paid: 1,
        is_displayed: 1,
        status: 1,
      },
      select: { id: true, name: true, price: true, status: true },
    });

    // Set array of data for creating new student courses
    const newPremiumCourses = unownedCourses.map((course) => ({
      student_id: studentId,
      course_id: course.id,
      course_tier: CourseTierStatus.PREMIUM,
      expiration_date: expirationDate,
    }));

    // Process all database operations concurrently
    const [createdCourses, updatedStudent] = await Promise.all([
      // Create new premium course access entries
      this.database.student_courses.createMany({ data: newPremiumCourses }),

      // Upgrade account to premium
      this.database.students.update({
        where: { id: studentId },
        data: {
          account_type: StudentAccountType.PREMIUM,
          last_premium_activation: activationDate,
        },
      }),

      // Convert expired permanent courses
      this.convertExpiredToPremiumCourses(studentId),
    ]);

    return createdCourses;
  }

  // Converts expired permanent student courses to premium tier courses
  async convertExpiredToPremiumCourses(studentId: number) {
    // Find all expired permanent courses
    const expiredCourses = await this.database.student_courses.findMany({
      where: {
        student_id: studentId,
        status: 0,
        course_tier: CourseTierStatus.PERMANENT,
        expiration_date: {
          lte: new UTCDate(),
        },
      },
      select: {
        id: true,
        course_id: true,
      },
    });

    if (expiredCourses.length === 0) return;

    for (const expiredCourse of expiredCourses) {
      // Ensure expired course is deactivated
      await this.database.student_courses.update({
        where: { id: expiredCourse.id },
        data: { status: 0 },
      });

      // Create premium tier equivalent
      await this.database.student_courses.create({
        data: {
          student_id: studentId,
          course_id: expiredCourse.course_id,
          course_tier: CourseTierStatus.PREMIUM,
        },
      });
    }
  }

  // Cancels stripe subscription, End Premium Subscription
  async endPremiumAndCancelSubscription(studentId: number) {
    await Promise.all([this.stripeService.findAndCancelSubscription(studentId), this.endPremiumCourses(studentId)]);
  }

  // End Premium Subscription
  async endPremiumCourses(studentId: number) {
    const [updatedStudent, premiumStudCourses, expiredStudPermanentCourses] = await Promise.all([
      // Downgrade student account to basic tier
      this.database.students.update({
        where: { id: studentId },
        data: { account_type: StudentAccountType.BASIC },
      }),

      // Find all active premium courses
      this.database.student_courses.findMany({
        where: {
          student_id: studentId,
          course_tier: CourseTierStatus.PREMIUM,
          status: 1,
        },
        select: { id: true },
      }),

      // Find all expired permanent courses that were previously deactivated
      this.database.student_courses.findMany({
        where: {
          student_id: studentId,
          course_tier: CourseTierStatus.PERMANENT,
          status: 0,
          expiration_date: {
            not: null,
            lte: new UTCDate(),
          },
        },
        distinct: ['course_id'],
        select: { id: true, course_id: true },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    if (premiumStudCourses.length > 0 || expiredStudPermanentCourses.length > 0) {
      const premiumStudCourseIds = premiumStudCourses.map((course) => course.id);
      const expiredStudCourseIds = expiredStudPermanentCourses.map((course) => course.id);

      await Promise.all([
        // Deactivate premium courses
        this.database.student_courses.updateMany({
          where: {
            id: { in: premiumStudCourseIds },
            student_id: studentId,
          },
          data: { status: 0 },
        }),

        // Reactivate expired permanent courses for visibility
        this.database.student_courses.updateMany({
          where: {
            id: { in: expiredStudCourseIds },
            student_id: studentId,
          },
          data: { status: 1 },
        }),
      ]);
    }
  }

  // Reactivates premium student courses
  async renewPremium(studentId: number, endDate: Date) {
    // Get inactive premium courses all current premium courses
    const premiumStudCourses = await this.database.student_courses.findMany({
      where: { course_tier: CourseTierStatus.PREMIUM, student_id: studentId, status: 0 },
      select: { id: true, course_id: true },
      distinct: ['course_id'],
    });
    const premiumStudCourseIds = premiumStudCourses.map((sc) => sc.id);

    await Promise.all([
      // Reactivate student premium courses
      this.database.student_courses.updateMany({
        where: { id: { in: premiumStudCourseIds } },
        data: { expiration_date: endDate, status: 1 },
      }),

      // Update student account type
      this.database.students.update({
        where: { id: studentId },
        data: {
          account_type: StudentAccountType.PREMIUM,
          last_premium_activation: endDate,
        },
      }),
    ]);
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
        paid: 1,
        is_displayed: 1,
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

    return createdDatas;
  }
}
