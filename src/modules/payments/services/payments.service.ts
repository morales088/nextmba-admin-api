import { Injectable } from '@nestjs/common';
import { PaymentRepository } from '../repositories/payment.repository';

@Injectable()
export class PaymentsService {
    constructor(
      private readonly paymentRepository: PaymentRepository
    ) {}

    async getPayment(id:number) {
      return this.paymentRepository.findById(id);
    }
    
  async getPayments() {
    return this.paymentRepository.find();
  }
    
  async createPayment(data) {
    console.log(data)

    // check email if has account and return student_id

    // insert data to payment table and return payment_id

    // product code access and insert to product items



    //return payment details



    // return this.paymentRepository.insert(data);
  }

//   async updateModule(id: number, data) {
//     return this.moduleRepository.updateModule(id, data);
//   }
}
