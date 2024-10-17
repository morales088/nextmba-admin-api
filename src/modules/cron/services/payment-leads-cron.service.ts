import { Injectable, Logger } from '@nestjs/common';
import { processAndRemoveEntries, saveToCSV } from 'src/common/helpers/csv.helper';
import { PaymentLeadsDTO } from 'src/modules/payments/dto/upgrade-payment.dto';
import { PaymentRepository } from 'src/modules/payments/repositories/payment.repository';
import { PaymentsService } from 'src/modules/payments/services/payments.service';
import { ProductRepository } from 'src/modules/products/repositories/product.repository';
import { StripeService } from '../../stripe/stripe.service';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { addMonths, addWeeks, fromUnixTime } from 'date-fns';
import { UTCDate } from '@date-fns/utc';
import { CourseTierStatus, StudentAccountType, SubscriptionStatus } from '../../../common/constants/enum';
import { replace } from 'lodash';
import { delayMs, endOfDay, lastNumMonth, startOfDay } from '../../../common/helpers/date.helper';
import { Payments } from '@prisma/client';

@Injectable()
export class PaymentLeadsCronService {
  private readonly logger = new Logger(PaymentLeadsCronService.name);

  constructor(
    private readonly database: PrismaService,
    private readonly paymentService: PaymentsService,
    private readonly paymentRepository: PaymentRepository,
    private readonly productRepository: ProductRepository,
    private readonly stripeService: StripeService
  ) {}

  // for fixing subscription payment
  // start trial
  async activateTrialV2(studentId: number, trialStartDate?: Date) {
    // Get the student data
    const student = await this.database.students.findFirst({ where: { id: studentId } });

    const claimedTrial = student.claimed_trial ?? true;
    const claimedTrialAt = trialStartDate ?? student.claimed_trial_at;

    // Create an array of owned courses
    const studentCourses = await this.database.student_courses.findMany({
      where: { student_id: studentId, status: 1 },
      select: { course_id: true },
    });
    const studentCourseIds = studentCourses.map((sc) => sc.course_id);

    // Finds the courses that is unowned
    const unownedCourses = await this.database.courses.findMany({
      where: {
        id: { notIn: studentCourseIds },
        status: 1,
      },
    });

    // Create data for creating student courses
    const insertData = unownedCourses.map((course) => ({
      student_id: studentId,
      course_id: course.id,
      course_tier: CourseTierStatus.TRIAL,
      expiration_date: addWeeks(new UTCDate(), 1),
    }));

    // Update the student account type
    await this.database.students.update({
      where: { id: studentId },
      data: { account_type: StudentAccountType.TRIAL, claimed_trial: claimedTrial, claimed_trial_at: claimedTrialAt },
    });

    // Create courses
    const createdDatas = await Promise.all(
      insertData.map(async (data) => await this.database.student_courses.create({ data }))
    );

    return createdDatas;
  }

  // activate subscription
  async activatePremiumV2(studentId: number, premiumStartDate?: Date) {
    const student = await this.database.students.findFirst({ where: { id: studentId } });

    const lastPremiumActivation = premiumStartDate ?? student.last_premium_activation;

    // If student in the middle of trial, set those course to 0
    await this.database.student_courses.updateMany({
      where: { student_id: studentId, status: 1, course_tier: 3 },
      data: { status: 0 },
    });

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
      data: { account_type: StudentAccountType.PREMIUM, last_premium_activation: lastPremiumActivation },
    });

    // Create new student courses base on insertData
    const createdDatas = await Promise.all(
      insertData.map(async (data) => await this.database.student_courses.create({ data }))
    );

    return createdDatas;
  }

  async fixSubscriptionPayments() {
    try {
      const rowsData = await processAndRemoveEntries('payment-subscriptions.csv', 100);

      if (!Array.isArray(rowsData) || rowsData.length === 0) {
        this.logger.debug(`No data to process in CSV.`);
        return;
      }

      for (const rowData of rowsData) {
        // Id, Customer Id, Customer Email, Customer Name, Plan, Product
        const [subscriptionId, customerId, customerEmail, customerName] = rowData;

        // const student = await this.database.students.findFirst({
        //   where: { email: { equals: customerEmail, mode: 'insensitive' } },
        // });

        // if (!student) {
        //   this.logger.debug(`Student not found: ${customerEmail}`);
        //   continue;
        // }

        const subscription = await this.stripeService.retrieveSubscription(subscriptionId);

        if (subscription.status === SubscriptionStatus.INCOMPLETE) {
          this.logger.debug(`Subscription payment is incomplete: ${customerEmail}`);
          continue;
        }
        // console.log(`🔥 ~ subscription:`, subscription);

        // if (subscription.status === SubscriptionStatus.TRIALING) {
        //   await this.activateTrial(student.id, fromUnixTime(subscription.trial_start));
        //   this.logger.log(`Trial Activated ${fromUnixTime(subscription.trial_start)}: ${customerEmail}`);
        // } else if (subscription.status === SubscriptionStatus.ACTIVE) {
        //   await this.activatePremium(student.id, fromUnixTime(subscription.start_date));
        //   this.logger.log(`Premium Activated ${fromUnixTime(subscription.start_date)}: ${customerEmail}`);
        // }

        // const existingPayment = await this.database.payments.findFirst({
        //   where: { student_id: student.id, subscriptionId: subscriptionId },
        //   include: { product: true },
        // });

        // if (existingPayment) {
        //   this.logger.debug(`Subscription payment is already exists: ${customerEmail}`);
        //   continue;
        // }

        // if (payments?.length > 0) continue;

        // // check reference id if already exists
        // const existingPayment = await this.paymentRepository.findByReferenceId(referenceId);
        // if (existingPayment) {
        //   this.logger.debug(`Reference Id already exists: ${studentEmail}`);
        //   continue;
        // }

        const productCodeMap = {
          month: 'all_access_monthly',
          year: 'all_access_annual',
        };

        const subscriptionInterval = rowData.at(7);
        const subscriptionPrice = parseFloat(replace(rowData.at(8), ',', '.'));
        const subscriptionProductCode = productCodeMap[subscriptionInterval];

        // get product details
        const product = await this.productRepository.findByCode(subscriptionProductCode);

        if (!product) {
          this.logger.debug(`Invalid Product Code: ${customerEmail}`);
          continue;
        }

        const payment = await this.paymentService.createPayment({
          // name: student.name,
          // email: student.email,
          name: customerName,
          email: customerEmail,
          product_code: subscriptionProductCode,
          subscriptionId: subscription.id,
          price: subscriptionPrice,
        } as PaymentLeadsDTO);

        if (!payment) {
          this.logger.error(`Payment error occurred: ${customerEmail}`);
          continue;
        }

        this.logger.log(`Payment created: ${customerEmail}`);
      }
    } catch (error) {
      this.logger.error('An error occurred:', error.message);
    }
  }

  async fixStudentCourseData() {
    try {
      const startDate = startOfDay(lastNumMonth(1));
      const endDate = endOfDay();
      console.log(`🔥 ~ endDate:`, endDate);
      console.log(`🔥 ~ startDate:`, startDate);
      const premiumProductCodes = ['all_access_annual', 'all_access_monthly', 'all_access_monthly_10'];

      const payments = await this.database.payments.findMany({
        where: {
          NOT: { subscriptionId: null },
          product_code: { in: premiumProductCodes },
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: { student: true },
      });

      for (const payment of payments) {
        const studentPayments = await this.database.payments.findMany({
          where: { student_id: payment.student.id, status: 1, product_code: { notIn: premiumProductCodes } },
          select: { product: true, payment_items: true, student: true },
        });
        console.log(`🔥 ~ student: ${payment.student.email}`);
        // console.log(`🔥 ~ studentPayments:`, studentPayments);

        for (const studentPayment of studentPayments) {
          const paymentItems = studentPayment.payment_items;
          console.log(`🔥 ~ paymentItems:`, paymentItems);

          const studentCoursesPayments = paymentItems.filter(
            (paymentItem) => paymentItem.course_tier === CourseTierStatus.PREMIUM
          );
          console.log(`🔥 ~ studentCoursesPayments:`, studentCoursesPayments);

          for (const studentCoursesPayment of studentCoursesPayments) {
            await this.database.payment_items.update({
              where: { id: studentCoursesPayment.id },
              data: { course_tier: CourseTierStatus.PERMANENT },
            });

            const studentCourseToUpdate = await this.database.student_courses.findFirst({
              where: {
                course_id: studentCoursesPayment.course_id,
                student_id: studentPayment.student.id,
                course_tier: CourseTierStatus.PREMIUM,
                status: 1,
              },
            });
            console.log(`🔥 ~ studentCourseToUpdate:`, studentCourseToUpdate);

            if (studentCourseToUpdate) {
              const updatedStudentCourse = await this.database.student_courses.update({
                where: { id: studentCourseToUpdate.id },
                data: { course_tier: CourseTierStatus.PERMANENT },
              });
              console.log(`🔥 ~ updatedStudentCourse:`, updatedStudentCourse);
            }
          }
        }

        // For fixing student course subscription end date
        // Get all courses that came with premium
        await this.updateStudentCourseEndDateSubscription(payment.student.id);
        await delayMs(500);
      }
    } catch (error) {
      this.logger.error('An error occurred while exporting studentPayments data:', error.message);
    }
  }

  async updateStudentCourseEndDateSubscription(studentId: number) {
    const paymentSubscription = await this.database.payments.findFirst({
      where: { student_id: studentId, status: 1, NOT: { subscriptionId: null } },
      orderBy: { createdAt: 'desc' },
    });

    const stripeSubscription = await this.stripeService.retrieveSubscription(paymentSubscription.subscriptionId);
    const subscriptionEndDate = fromUnixTime(stripeSubscription.current_period_end);
    console.log(`🔥 ~ subscriptionEndDate:`, subscriptionEndDate);

    const studentCourses = await this.database.student_courses.findMany({
      where: { student_id: studentId, course_tier: CourseTierStatus.PREMIUM, status: 1 },
      select: { id: true },
    });

    // Update all the courses so that the student doesn't have access to it
    if (studentCourses.length > 0) {
      const studentCourseIds = studentCourses.map((sc) => sc.id);

      const results = await this.database.student_courses.updateMany({
        where: { id: { in: studentCourseIds } },
        data: { expiration_date: subscriptionEndDate },
      });
      console.log(`🔥 ~ results:`, results);

      return results;
    }
  }

  async checkPaymentLeads() {
    try {
      const rowsData = await processAndRemoveEntries('payment-leads.csv', 500);

      if (!Array.isArray(rowsData) || rowsData.length === 0) {
        this.logger.debug(`No data to process in CSV.`);
        return;
      }

      for (const rowData of rowsData) {
        const [studentName, studentEmail, productCode, referenceId, amountPaid] = rowData;

        // check reference id if already exists
        const existingPayment = await this.paymentRepository.findByReferenceId(referenceId);
        if (existingPayment) {
          this.logger.debug(`Reference Id already exists: ${studentEmail}`);
          continue;
        }

        // get product details
        const product = await this.productRepository.findByCode(productCode);
        if (!product) {
          this.logger.debug(`Invalid Product Code: ${studentEmail}`);
          continue;
        }

        const payment = await this.paymentService.createPayment({
          name: studentName,
          email: studentEmail,
          product_code: productCode,
          reference_id: referenceId,
          price: amountPaid,
        } as PaymentLeadsDTO);

        if (!payment) {
          this.logger.error(`Payment error occurred: ${studentEmail}`);
          continue;
        }

        this.logger.log(`Payment created: ${studentEmail}`);
      }
    } catch (error) {
      this.logger.error('An error occurred:', error.message);
    }
  }
}
