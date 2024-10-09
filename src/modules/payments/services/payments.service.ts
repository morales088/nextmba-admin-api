import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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
    try {
      // Check reference id if already exists
      const existingPayment = await this.paymentRepository.findByReferenceId(data.reference_id);
      if (existingPayment) throw new Error('Reference Id already exists.');

      // Get product details
      const product = await this.productRepository.findByCode(data.product_code);
      if (!product) throw new Error('Invalid Product Code.');

      // Check if email has account and return student_id
      let studentId: number;
      const findStudent = await this.studentRepository.findByEmail(data.email);

      if (findStudent) {
        // Update student library access and account type based on product
        if (product.library_access === true || product.pro_access === true) {
          const updateStudent = {
            library_access: product.library_access === true ? 1 : 0,
            // account_type: product.pro_access === true ? 3 : findStudent.account_type,
          };

          await this.studentsService.updateStudent(findStudent.id, updateStudent);
        }

        studentId = findStudent.id;
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
        // Find subscription of student
        const subscription = !createdPayment.subscriptionId
          ? await this.stripeService.findSubscription(studentId, product.code)
          : await this.stripeService.retrieveSubscription(createdPayment.subscriptionId);

        if (subscription?.status === SubscriptionStatus.TRIALING) {
          await this.studentPlanService.activateTrial(studentId);
        } else if (subscription?.status === SubscriptionStatus.ACTIVE) {
          await this.studentPlanService.activatePremium(studentId);
        }

        await this.paymentRepository.update(createdPayment.id, { subscriptionId: paymentData.subscriptionId });
      }

      if (createdPayment) {
        // Email payment information
        // await this.sendMailService.emailPaymentInformation({
        //   ...createPayment,
        //   productName: product.name,
        // );

        // Email courses information
        if (findStudent) {
          const coursesName = await this.productRepository.coursesPerProduct(data.product_code);

          const emailCourseData = {
            student: data.name,
            productName: product.name,
            courses: coursesName,
          };

          await this.sendMailService.emailCourseInformation(data.email, emailCourseData);
        }
      }

      // // Add new created student to mailerlite
      // this.studentsService.addCreatedStudentToCourseGroups(studentId);

      return createdPayment;
    } catch (error) {
      console.log('');
      this.logger.error(`An error occurred while processing payment:`);
      this.logger.error(`Email: ${data.email}`);
      this.logger.error(`Error: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }

  async updatePayment(id: number, data) {
    return this.paymentRepository.update(id, data);
  }
  async studentPaymentInfo(id: number) {
    return this.paymentRepository.studentPaymentInfo(id);
  }
}
