import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Affiliates, Billing_infos, Files } from '@prisma/client';

@Injectable()
export class BillingRepository extends AbstractRepository<Billing_infos> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Billing_infos'; // Specify the Prisma model name for entity
  }

  async find(): Promise<Billing_infos> {
    return this.prisma[this.modelName].findMany({
      where: { status: 1 },
      include: { student: true },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  async findById(id: number) {
    return this.prisma[this.modelName].findFirst({
      include: { student: true },
      where: { id },
    });
  }

  async findByStudId(id: number) {
    return this.prisma[this.modelName].findFirst({
      where: { student_id : id, status:1 },
      include: { student: true },
    });
  }

  // async updateAffiliate(id: number, data: UpdateAffiliateDto): Promise<Affiliates> {
  //   const affiliate = await this.findById(id);

  //   if (!affiliate) {
  //     throw new BadRequestException('affiliate does not exist.');
  //   }

  //   return this.prisma[this.modelName].update({
  //     where: { id: id },
  //     data: data,
  //     include: { student: true },
  //   });
  // }
}
