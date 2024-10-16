import { BadRequestException, Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { PaymentRepository } from '../repositories/payment.repository';
import { StudentRepository } from 'src/modules/students/repositories/student.repository';
import { StudentsService } from 'src/modules/students/services/students.service';
import { ProductRepository } from 'src/modules/products/repositories/product.repository';
import { PaymentItemRepository } from '../repositories/payment_item.repository';
import { PaymentAffiliateRepository } from '../repositories/payment_affiliate.repository';
import { SendMailService } from 'src/common/utils/send-mail.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { StudentPlanService } from '../../student-plan/services/student-plan.service';
import { ChargeType, SubscriptionStatus } from '../../../common/constants/enum';
import { StripeService } from '../../stripe/stripe.service';
import { Payments, Products } from '@prisma/client';
import { fromUnixTime } from 'date-fns';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    protected readonly prisma: PrismaService,
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentItemRepository: PaymentItemRepository,
    private readonly studentRepository: StudentRepository,
    private readonly productRepository: ProductRepository,
    private readonly paymentAffiliateRepository: PaymentAffiliateRepository,
    private readonly studentsService: StudentsService,
    private readonly sendMailService: SendMailService,
    private readonly studentPlanService: StudentPlanService,
    private readonly stripeService: StripeService
  ) {}

  async getPayment(id: number) {
    return this.paymentRepository.findById(id);
  }

  async getPayments(user, searchFilter: any, page: number, per_page: number) {
    return this.paymentRepository.payments(user, searchFilter, page, per_page);
  }

  async createPayment(data: any) {
    console.info('New Payment Initialized');
    try {
      // Check reference id if already exists
      const existingPayment = await this.paymentRepository.findByReferenceId(data.reference_id);
      if (existingPayment) throw new Error('Reference Id already exists.');

      // Get product details
      const product = await this.productRepository.findByCode(data.product_code);
      if (!product) throw new Error('Invalid Product Code.');

      // Check if email has account and return student_id
      let studentId: number;
      const existingStudent = await this.studentRepository.findByEmail(data.email);

      if (existingStudent) {
        if (product.library_access === true || product.pro_access === true) {
          // Update student library access and account type based on product
          await this.studentsService.updateStudent(existingStudent.id, {
            library_access: product.library_access === true ? 1 : 0,
            // account_type: product.pro_access === true ? 3 : existingStudent.account_type,
          });
        }

        studentId = existingStudent.id;
      } else {
        // Create new student account
        const studentData = {
          name: data.name,
          email: data.email,
          library_access: product.library_access === true ? 1 : 0,
          // account_type: product.pro_access === true ? 3 : 1,
          created_by: data.created_by,
        };

        // Use transaction query
        const createStudent = await this.studentsService.createStudentTx(studentData);

        studentId = createStudent.id;
      }

      // Check if student already claimed trial: End trial subscription to generate new invoice
      if (data?.subscriptionId && existingStudent?.claimed_trial === true) {
        const subscription = await this.stripeService.retrieveSubscription(data.subscriptionId);

        if (subscription?.status === SubscriptionStatus.TRIALING) {
          console.log('Ending trial subscription: Student already claimed the trial.');
          await this.stripeService.endTrialSubscription(subscription.id);
        }
      }

      const paymentData = {
        ...data,
      };

      // Affiliate's feature
      const affiliate = await this.paymentAffiliateRepository.findPerCode(data.affiliate_code);
      if (data.affiliate_code && affiliate) {
        // Count affiliate on payments
        const affiliatePayment = await this.paymentRepository.findByFromStudId(affiliate.student_id);
        let affiliateCount = (affiliatePayment as unknown as object[]).length;
        // ++affiliateCount;

        const partnerAffiliate = parseInt(process.env.partnerAffiliate_count);
        const proAffiliate = parseInt(process.env.proAffiliate_count);

        const beginnerPercentage = parseFloat(process.env.beginnerCommissionPercent);
        const partnerPercentage = parseFloat(process.env.partnerCommissionPercent);

        let commission_percentage = beginnerPercentage;
        if (affiliateCount >= partnerAffiliate) commission_percentage = partnerPercentage;

        await this.paymentAffiliateRepository.update(affiliate.id, { percentage: commission_percentage });

        paymentData.from_student_id = affiliate.student_id;
        paymentData.commission_percentage = commission_percentage;
      }

      // Insert data to payments
      const createdPayment = await this.paymentRepository.insert(studentId, product.id, paymentData);

      // Check for the product charge type and subscription status
      if (product.charge_type === ChargeType.ONE_OFF) {
        await this.paymentItemRepository.insert(studentId, createdPayment.id, data.product_code, data.origin);
      } else if (product.charge_type === ChargeType.RECURRING) {
        await this.handleSubscriptionPayment(createdPayment, product, studentId);
      }

      if (createdPayment) {
        // Email payment information
        // await this.sendMailService.emailPaymentInformation({
        //   ...createPayment,
        //   productName: product.name,
        // );

        // Email courses information
        if (existingStudent) {
          const coursesName = await this.productRepository.coursesPerProduct(data.product_code);

          await this.sendMailService.emailCourseInformation(data.email, {
            student: data.name,
            productName: product.name,
            courses: coursesName,
          });
        }
      }

      // // Add new created student to mailerlite
      // this.studentsService.addCreatedStudentToCourseGroups(studentId);

      console.info(`Payment Completed: ${createdPayment.email}`);
      return createdPayment;
    } catch (error) {
      console.log('');
      this.logger.error(`An error occurred while processing payment:`);
      this.logger.error(`Email: ${data.email}`);
      this.logger.error(`Error: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }

  private async handleSubscriptionPayment(payment: Payments, product: Products, studentId: number) {
    const subscription =
      payment?.subscriptionId !== null
        ? await this.stripeService.retrieveSubscription(payment.subscriptionId)
        : await this.stripeService.findSubscription(studentId, product.code);

    if (!subscription) {
      throw new UnprocessableEntityException('No subscription found for the student.');
    }

    if (subscription?.status === SubscriptionStatus.TRIALING) {
      await this.studentPlanService.activateTrial(
        studentId,
        fromUnixTime(subscription.trial_start),
        fromUnixTime(subscription.trial_end)
      );
    } else if (subscription?.status === SubscriptionStatus.ACTIVE) {
      await this.studentPlanService.activatePremium(
        studentId,
        fromUnixTime(subscription.start_date),
        fromUnixTime(subscription.current_period_end)
      );
    } else {
      throw new UnprocessableEntityException('Subscription status is incomplete or inactive.');
    }

    await this.paymentRepository.update(payment.id, { subscriptionId: subscription.id });
  }

  async updatePayment(id: number, data) {
    return this.paymentRepository.update(id, data);
  }
  async studentPaymentInfo(id: number) {
    return this.paymentRepository.studentPaymentInfo(id);
  }
}
