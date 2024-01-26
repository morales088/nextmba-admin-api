import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentRepository } from '../repositories/payment.repository';
import { StudentRepository } from 'src/modules/students/repositories/student.repository';
import { StudentsService } from 'src/modules/students/services/students.service';
import { ProductRepository } from 'src/modules/products/repositories/product.repository';
import { PaymentAffiliateRepository } from '../repositories/payment_affiliate.repository';
import { SendMailService } from 'src/common/utils/send-mail.service';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(
    protected readonly prisma: PrismaService,
    private readonly paymentRepository: PaymentRepository,
    private readonly studentRepository: StudentRepository,
    private readonly productRepository: ProductRepository,
    private readonly paymentAffiliateRepository: PaymentAffiliateRepository,
    private readonly studentsService: StudentsService,
    private readonly sendMailService: SendMailService
  ) {}

  async getPayment(id: number) {
    return this.paymentRepository.findById(id);
  }

  async getPayments(user, search: string, page: number, per_page: number) {
    return this.paymentRepository.payments(user, search, page, per_page);
  }

  async createPayment(data) {
    // const payment = this.prisma.$transaction(async (prisma) => {

    // get product details
    const product = await this.productRepository.findByCode(data.product_code);
    if (!product) return { message: 'Invalid Product Code.' };

    // check if email has account and return student_id
    let studentId: number;
    const findStudent = await this.studentRepository.findByEmail(data.email);
    if (findStudent) {
      if (product.library_access === true || product.pro_access === true) {
        const updateStudent = {
          library_access: product.library_access === true ? 1 : 0,
          account_type: product.pro_access === true ? 3 : findStudent.account_type,
        };

        this.studentsService.updateStudent(findStudent.id, updateStudent);
      }

      // email courses info to student
      const emailData = {
        student: data.email,
        productName: product.name,
      };
      this.sendMailService.emailCourseInformation(data.email, emailData);

      studentId = findStudent.id;
    } else {
      // create student
      const studentData = {
        name: data.name,
        email: data.email,
        library_access: product.library_access === true ? 1 : 0,
        account_type: product.pro_access === true ? 2 : 1,
      };

      const createStudent = await this.studentsService.createStudent(studentData);

      studentId = createStudent.id;
    }

    const paymentData = {
      ...data,
    };

    // get affiliate infos
    const affiliate = await this.paymentAffiliateRepository.findPerCode(data.affiliate_code);
    if (data.affiliate_code && affiliate) {
      // ALLABOUT AFFILIATES
      // count affiliate on payments
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
    // insert data to payment table and return payment_id
    const createPayment = await this.paymentRepository.insert(studentId, product.id, paymentData);

    //   return createPayment;
    // });

    // email payment information
    if (createPayment) {
      const emailData = {
        ...createPayment,
        productName: product.name,
      };
      this.sendMailService.emailPaymentInformation(emailData);
    }
    
    // email courses info to student
    const coursesName = await this.productRepository.coursesPerProduct(data.product_code);
    
    const emailData = {
      student: data.name,
      productName: product.name,
      courses: coursesName,
    };
    this.sendMailService.emailCourseInformation(data.email, emailData);

    //return payment details
    return createPayment;
  }

  async updatePayment(id: number, data) {
    return this.paymentRepository.update(id, data);
  }
}
