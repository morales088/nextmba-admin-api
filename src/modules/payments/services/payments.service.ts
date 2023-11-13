import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentRepository } from '../repositories/payment.repository';
import { StudentRepository } from 'src/modules/students/repositories/student.repository';
import { StudentsService } from 'src/modules/students/services/students.service';
import { ProductRepository } from 'src/modules/products/repositories/product.repository';
import { PaymentAffiliateRepository } from '../repositories/payment_affiliate.repository';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly studentRepository: StudentRepository,
    private readonly productRepository: ProductRepository,
    private readonly paymentAffiliateRepository: PaymentAffiliateRepository,
    private readonly studentsService: StudentsService
  ) {}

  async getPayment(id: number) {
    return this.paymentRepository.findById(id);
  }

  async getPayments() {
    return this.paymentRepository.find();
  }

  async createPayment(data) {
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

      studentId = findStudent.id;
    } else {
      // create student
      const studentData = {
        name: data.name,
        email: data.email,
        library_access: product.library_access === true ? 1 : 0,
        account_type: product.pro_access === true ? 3 : 2,
      };

      const createStudent = await this.studentsService.createStudent(studentData);

      studentId = createStudent.id;
    }

    // ALLABOUT AFFILIATES
    // get affiliate infos
    const affiliate = await this.paymentAffiliateRepository.findPerCode(data.affiliate_code);
    // count affiliate on payments
    const affiliatePayment = await this.paymentRepository.findByFromStudId(affiliate.student_id);
    const affiliateCount = (affiliatePayment as unknown as object[]).length;

    const partnerAffiliate = parseInt(process.env.partnerAffiliate_count);
    const proAffiliate = parseInt(process.env.proAffiliate_count);

    const beginnerPercentage = parseFloat(process.env.beginnerCommissionPercent);
    const partnerPercentage = parseFloat(process.env.partnerCommissionPercent);
    const proPercentage = parseFloat(process.env.proCommissionPercent);
    const vipPercentage = parseFloat(process.env.vipCommissionPercent);

    let commission_percentage = beginnerPercentage;
    if (affiliateCount >= partnerAffiliate) {
      commission_percentage = partnerPercentage;
    } else if (affiliateCount >= proAffiliate) {
      commission_percentage = proPercentage;
    }
    
    await this.paymentAffiliateRepository.update(affiliate.id, { percentage: commission_percentage });

    const paymentData = {
      ...data,
      from_student_id : affiliate.student_id,
      commission_percentage : commission_percentage
    };

    // insert data to payment table and return payment_id
    const createPayment = await this.paymentRepository.insert(studentId, product.id, paymentData)

    //return payment details
    return createPayment;
  }

  //   async updateModule(id: number, data) {
  //     return this.moduleRepository.updateModule(id, data);
  //   }
}
