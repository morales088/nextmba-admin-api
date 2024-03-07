import { Injectable } from '@nestjs/common';
import { BillingRepository } from '../repositories/billing.repository';
import { CreateBillingDto } from '../dto/create-billing.dto';
import { UpdateBillingDto } from '../dto/update-billing.dto';

@Injectable()
export class BillingsService {
    constructor(
      private readonly billingRepository: BillingRepository,
    ) {}

    async getBillings() {
        return await this.billingRepository.find()
    }

    async getBilling(id:number) {
        return await this.billingRepository.findById(id)
    }

    async createBilling(data: CreateBillingDto) {
        return await this.billingRepository.create(data)
    }

    async updateBilling(id:number, data: UpdateBillingDto) {
        return await this.billingRepository.updateBilling(id, data)
    }

    async getStudentBillings(studentId:number) {
        return await this.billingRepository.findByStudId(studentId)
    }

}
