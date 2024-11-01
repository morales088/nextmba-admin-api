import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Affilate_withdraws } from '@prisma/client';
import { UpdateWithdrawRequestDto } from '../dto/update-withdraw-request.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { CommissionStatus, WithdrawRequestStatus } from '../../../common/constants/enum';

@Injectable()
export class AffiliateWithdrawRepository {
  constructor(protected readonly prisma: PrismaService) {}

  async findById(withdrawId: number) {
    return this.prisma.affilate_withdraws.findFirst({ where: { id: withdrawId }, include: { student: true } });
  }

  async findAffiliateWithdraws(status?: number): Promise<Affilate_withdraws[]> {
    return this.prisma.affilate_withdraws.findMany({
      where: { ...(status && { status }) },
      include: { student: true },
      orderBy: { id: 'desc' },
    });
  }

  async getWithdrawalInfo(studentId: number) {
    // Total commission calculation
    const paymentCommissions = await this.prisma.payments.findMany({
      where: { from_student_id: studentId, status: 1 },
    });

    const totalCommissionAmount = paymentCommissions.reduce((total, payment) => {
      const commissionAmount = new Decimal(payment.price).mul(new Decimal(payment.commission_percentage));
      return total.plus(commissionAmount);
    }, new Decimal(0));

    // Paid commission calculation
    const paidCommissions = await this.prisma.payments.findMany({
      where: {
        from_student_id: studentId,
        commission_status: 1,
        status: 1,
      },
    });

    const paidCommissionAmount = paidCommissions.reduce((total, commission) => {
      const commissionAmount = new Decimal(commission.price).mul(new Decimal(commission.commission_percentage));
      return total.plus(commissionAmount);
    }, new Decimal(0));

    const currentBalance = totalCommissionAmount.minus(paidCommissionAmount);

    return {
      total_commission: totalCommissionAmount.toFixed(2),
      paid_commission: paidCommissionAmount.toFixed(2),
      currentBalance: currentBalance.toFixed(2),
    };
  }

  async updateAffiliateWithdraw(
    withdrawId: number,
    updateWithdrawRequestDto: UpdateWithdrawRequestDto
  ): Promise<Affilate_withdraws> {
    // Update commission_status on payments
    const commissionStatus =
      updateWithdrawRequestDto.status === WithdrawRequestStatus.PROCESSED
        ? CommissionStatus.PAID
        : CommissionStatus.UNPAID;

    const withdrawalPayments = await this.prisma.withdrawal_payments.findMany({
      where: { withdrawal_id: withdrawId },
    });

    const withdrawalPaymentIds = withdrawalPayments.map((withdrawal) => withdrawal.payment_id);

    await this.prisma.payments.updateMany({
      where: { id: { in: withdrawalPaymentIds } },
      data: { commission_status: commissionStatus },
    });

    return this.prisma.affilate_withdraws.update({
      where: { id: withdrawId },
      data: updateWithdrawRequestDto,
      include: { student: true },
    });
  }
}
