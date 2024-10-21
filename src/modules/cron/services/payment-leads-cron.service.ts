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

  // async fixStudentCourseData() {
  //   try {
  //     const startDate = startOfDay(lastNumMonth(1, new Date('2024-10-20')));
  //     const endDate = endOfDay(new Date('2024-10-11'));
  //     console.log(`🔥 ~ startDate:`, startDate);
  //     console.log(`🔥 ~ endDate:`, endDate);
  //     const premiumProductCodes = ['all_access_annual', 'all_access_monthly', 'all_access_monthly_10'];

  //     const payments = await this.database.payments.findMany({
  //       where: {
  //         student: { status: 1 },
  //         NOT: { subscriptionId: null },
  //         product_code: { in: premiumProductCodes },
  //         createdAt: {
  //           gte: startDate,
  //           lte: endDate,
  //         },
  //       },
  //       select: { student: true },
  //       orderBy: { createdAt: 'asc' },
  //       distinct: ['student_id'],
  //       // skip: 100,
  //       // take: ,
  //     });
  //     console.log(`🔥 ~ payments:`, payments.length);

  //     for (const payment of payments) {
  //       console.log(`🔥 ~ student: ${payment.student.email}`);

  //       const studentPayments = await this.database.payments.findMany({
  //         where: {
  //           student_id: payment.student.id,
  //           status: 1,
  //           product_code: { notIn: premiumProductCodes },
  //         },
  //         select: {
  //           product: true,
  //           payment_items: true,
  //           student: {
  //             select: {
  //               id: true,
  //               email: true,
  //               claimed_trial: true,
  //               claimed_trial_at: true,
  //               last_premium_activation: true,
  //               status: true,
  //             },
  //           },
  //         },
  //       });

  //       const filterStudentPayments = studentPayments.filter((studPayment) => studPayment.payment_items.length !== 0);

  //       for (const studentPayment of filterStudentPayments) {
  //         const studentCoursesPermanent = studentPayment.payment_items
  //           .filter((paymentItem) => paymentItem.course_tier === CourseTierStatus.PERMANENT)
  //           .map((sc) => sc.course_id);

  //         console.log(`🔥 ~ studentCoursesPermanent:`, studentCoursesPermanent);

  //         // Update student courses that should be premium courses
  //         const result = await this.database.student_courses.updateMany({
  //           where: {
  //             course_id: { notIn: studentCoursesPermanent },
  //             student_id: studentPayment.student.id,
  //             // course_tier: CourseTierStatus.PERMANENT,
  //             status: 1,
  //           },
  //           data: {
  //             course_tier: CourseTierStatus.PREMIUM,
  //           },
  //         });
  //         console.log(`🔥 ~ result:`, result);
  //       }

  //       // // Get all courses that came with premium
  //       // await this.updateStudentCourseEndDateSubscription(payment.student.id);
  //       // await delayMs(300);
  //     }
  //   } catch (error) {
  //     this.logger.error('An error occurred while exporting studentPayments data:', error.message);
  //   }
  // }

  // // For fixing student course subscription end date
  // async updateStudentCourseEndDateSubscription(studentId: number) {
  //   const paymentSubscription = await this.database.payments.findFirst({
  //     where: { student_id: studentId, status: 1, NOT: { subscriptionId: null } },
  //     orderBy: { createdAt: 'desc' },
  //   });

  //   if (paymentSubscription.subscriptionId) {
  //     const subscription = await this.stripeService.retrieveSubscription(paymentSubscription.subscriptionId);
  //     const activationDate = fromUnixTime(subscription.start_date);
  //     const subscriptionEndDate = fromUnixTime(subscription.current_period_end);
  //     console.log(`🔥 ~ activationDate:`, activationDate);
  //     console.log(`🔥 ~ subscriptionEndDate:`, subscriptionEndDate);

  //     const studentCourses = await this.database.student_courses.findMany({
  //       where: { student_id: studentId, course_tier: CourseTierStatus.PREMIUM, status: 1 },
  //       select: { id: true },
  //     });

  //     // Update all the courses so that the student doesn't have access to it
  //     if (studentCourses.length > 0) {
  //       const studentCourseIds = studentCourses.map((sc) => sc.id);

  //       const results = await this.database.student_courses.updateMany({
  //         where: { id: { in: studentCourseIds } },
  //         data: { starting_date: activationDate, expiration_date: subscriptionEndDate },
  //       });
  //       console.log(`🔥 ~ results:`, results);

  //       return results;
  //     }
  //   }
  // }

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
