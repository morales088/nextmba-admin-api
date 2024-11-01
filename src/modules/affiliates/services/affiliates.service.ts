import { Injectable, NotFoundException } from '@nestjs/common';
import { AffiliateRepository } from '../repositories/affiliate.repository';
import { AffiliateWithdrawRepository } from '../repositories/affiliate-withdraw.repository';
import { WithdrawStatus } from '../../../common/constants/enum';
import { UpdateAffiliateDto } from '../dto/update-affiliate.dto';
import { UpdateWithdrawRequestDto } from '../dto/update-withdraw-request.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class AffiliatesService {
  constructor(
    private readonly affiliateRepository: AffiliateRepository,
    private readonly affiliateWithdrawRepository: AffiliateWithdrawRepository
  ) {}

  async getAffiliate(id: number) {
    const affiliate = await this.affiliateRepository.findById(id);

    const withdrawInfo = await this.affiliateWithdrawRepository.getWithdrawalInfo(affiliate.student_id);

    return {
      ...affiliate,
      withdrawInfo,
    };
  }

  async getAffiliates(page: number, perPage: number) {
    const affiliates = await this.affiliateRepository.find(page, perPage);

    const results = await Promise.all(
      affiliates.map(async (affiliate) => ({
        ...affiliate,
        withdrawInfo: await this.affiliateWithdrawRepository.getWithdrawalInfo(affiliate.student_id),
      }))
    );

    return results;
  }

  async updateAffiliate(id: number, updateAffiliateDto: UpdateAffiliateDto) {
    return this.affiliateRepository.updateAffiliate(id, updateAffiliateDto);
  }

  async getAffiliateWithdraw(withdrawId: number) {
    return this.affiliateWithdrawRepository.findById(withdrawId);
  }

  async getAffiliateWithdraws() {
    const [withdraws, pending, approved] = await Promise.all([
      this.affiliateWithdrawRepository.findAffiliateWithdraws(),
      this.affiliateWithdrawRepository.findAffiliateWithdraws(WithdrawStatus.PENDING),
      this.affiliateWithdrawRepository.findAffiliateWithdraws(WithdrawStatus.APPROVED),
    ]);

    const totalPaidAmount = approved.reduce((total, item) => {
      const paidAmount = new Decimal(item.withdraw_amount);
      return total.plus(paidAmount);
    }, new Decimal(0));

    return {
      withdraws,
      pending: pending.length,
      approved: approved.length,
      paid: totalPaidAmount,
    };
  }

  async updateAffiliateWithdraw(id: number, updateWithdrawRequestDto: UpdateWithdrawRequestDto) {
    const affiliateWithdraw = await this.affiliateWithdrawRepository.findById(id);

    if (!affiliateWithdraw) throw new NotFoundException('Affiliate withdraw does not exist.');

    return this.affiliateWithdrawRepository.updateAffiliateWithdraw(affiliateWithdraw.id, updateWithdrawRequestDto);
  }
}
