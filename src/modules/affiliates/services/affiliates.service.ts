import { Injectable } from '@nestjs/common';
import { AffiliateRepository } from '../repositories/affiliate.repository';
import { AffiliateWithdrawRepository } from '../repositories/affiliate-withdraw.repository';

@Injectable()
export class AffiliatesService {
  constructor(
    private readonly affiliateRepository: AffiliateRepository,
    private readonly affiliateWithdrawRepository: AffiliateWithdrawRepository
  ) {}

  async getAffiliate(id: number) {
    const result = await this.affiliateRepository.findById(id);
    result.withdrawInfo = await this.affiliateWithdrawRepository.getWithdrawalInfo(result.student_id)
    return result
  }

  async getAffiliates() {
    const results = await this.affiliateRepository.find();
    const affiliates = results as unknown as {
      student_id: number;
      withdrawInfo: Object;
    }[]
    for(const affiliate of affiliates){
      affiliate.withdrawInfo = await this.affiliateWithdrawRepository.getWithdrawalInfo(affiliate.student_id)
    }
    return affiliates
  }

  async updateAffiliate(id: number, data) {
    return await this.affiliateRepository.updateAffiliate(id, data);
  }

  async getAffiliateWithdraw(id: number) {
    return this.affiliateWithdrawRepository.findById(id);
  }

  async getAffiliateWithdraws() {
    const withdraws = await this.affiliateWithdrawRepository.find();
    const pending = await this.affiliateWithdrawRepository.pendingWithdraws();
    const approved = await this.affiliateWithdrawRepository.approvedWithdraws();
    let paid = 0;
    approved.map((approve) => {
      paid = paid + approve.withdraw_amount;
    });

    return { withdraws, pending: pending.length, approved: approved.length, paid: 0 };
  }

  async updateAffiliateWithdraw(id: number, data) {
    return await this.affiliateWithdrawRepository.updateAffiliateWithdraw(id, data);
  }
}
