import { BadRequestException, Injectable } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Affiliates } from '@prisma/client';
import { PaymentItemRepository } from './payment_item.repository';

@Injectable()
export class PaymentAffiliateRepository extends AbstractRepository<Affiliates> {
  constructor(
    protected readonly prisma: PrismaService,
    private readonly paymentItemRepository: PaymentItemRepository
  ) {
    super(prisma);
  }

  get modelName(): string {
    return 'Affiliates'; // Specify the Prisma model name for entity
  }

  async find(): Promise<Affiliates> {
    return this.prisma[this.modelName].findMany({ where: { status: 1 } });
  }

  async findPerCode(code: string): Promise<Affiliates> {
    return this.prisma[this.modelName].findMany({ where: { code : code, status: 1 } });
  }

}
