import { BadRequestException, Injectable } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Affiliates } from '@prisma/client';

@Injectable()
export class PaymentAffiliateRepository {
  constructor(protected readonly database: PrismaService) {}

  async find(): Promise<Affiliates[]> {
    return this.database.affiliates.findMany({
      where: { status: 1 },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  async findPerCode(code: string): Promise<Affiliates> {
    return this.database.affiliates.findFirst({ where: { code, status: 1 } });
  }

  async update(id: number, data: Partial<Affiliates>): Promise<Affiliates> {
    const affiliate = await this.database.affiliates.findUnique({ where: { id } });

    if (!affiliate) throw new BadRequestException('Affiliate does not exist.');

    return this.database.affiliates.update({ where: { id }, data });
  }
}
