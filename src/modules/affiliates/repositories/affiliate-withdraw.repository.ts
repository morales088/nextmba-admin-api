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
    return this.prisma[this.modelName].findMany({ where: { status: 1 }, include: { student: true } });
  }

  async updateAffiliateWithdraw(id: number, data: UpdateAffiliateWithdrawDto): Promise<Affilate_withdraws> {
    const affiliateWithdraw = await this.findById(id);

    if (!affiliateWithdraw) {
      throw new BadRequestException('Affiliate Withdraw does not exist.');
    }

    return this.prisma[this.modelName].update({
      where: { id: id },
      data: data,
      include: {student:true},
    });
  }

  async pendingWithdraws() {
    return this.prisma[this.modelName].findMany({ where: { status: 1 } }); //[0 - decline, 1 - pending, 2 - approved]
  }

  async approvedWithdraws() {
    return this.prisma[this.modelName].findMany({
      where: { status: 2 },
    }); //[0 - decline, 1 - pending, 2 - approved]
  }

  async findById(id: number) {
    return this.prisma[this.modelName].findFirst({ where: { id }, include: { student: true } });
  }
}
