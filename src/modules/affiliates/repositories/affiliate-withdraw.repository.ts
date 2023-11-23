import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Affilate_withdraws } from '@prisma/client';
import { UpdateAffiliateWithdrawDto } from '../dto/update-affiliateWithdraw.dto';

@Injectable()
export class AffiliateWithdrawRepository extends AbstractRepository<Affilate_withdraws> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Affilate_withdraws'; // Specify the Prisma model name for entity
  }

  async find(): Promise<Affilate_withdraws> {
    return this.prisma[this.modelName].findMany({ where: { status: 1 } });
  }

  async updateAffiliateWithdraw(id: number, data: UpdateAffiliateWithdrawDto): Promise<Affilate_withdraws> {
    const affiliateWithdraw = await this.findById(id);

    if (!affiliateWithdraw) {
      throw new BadRequestException('Affiliate Withdraw does not exist.');
    }

    return this.prisma[this.modelName].update({
      where: { id: id },
      data: data,
    });
  }

  async pendingWithdraws() {
    return this.prisma[this.modelName].findMany({ where: { status: 1 } }); //[0 - decline, 1 - pending, 2 - approved]
  }

  async approvedWithdraws() {
    return this.prisma[this.modelName].findMany({
      where: { status: 2 }
    }); //[0 - decline, 1 - pending, 2 - approved]
  }

  async getWithdrawalInfo(studentId: number) {
    // total commission
    const commissions = await this.prisma.payments.findMany({
      where: {
        from_student_id: studentId,
        status: 1,
      },
    });

    let total_commission: number = 0;
    for (const commision of commissions) {
      const commissionPrice = commision.price as unknown as string;
      const commissionPercentage = commision.commission_percentage as unknown as string;
      total_commission += parseFloat(commissionPrice) * parseFloat(commissionPercentage);
    }

    // paid commision
    const paidCommitions = await this.prisma.payments.findMany({
      where: {
        from_student_id: studentId,
        commission_status: 1,
        status: 1,
      },
    });

    let paid_commission: number = 0;
    for (const paidCommission of paidCommitions) {
      const commissionPrice = paidCommission.price as unknown as string;
      const commissionPercentage = paidCommission.commission_percentage as unknown as string;
      paid_commission += parseFloat(commissionPrice) * parseFloat(commissionPercentage);
    }

    const currentBalance = total_commission - paid_commission;

    return { total_commission, paid_commission, currentBalance };
  }
}
