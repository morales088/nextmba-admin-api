import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { UpdateAffiliateDto } from '../dto/update-affiliate.dto';
import { Affiliates } from '@prisma/client';

@Injectable()
export class AffiliateRepository {
  constructor(protected readonly database: PrismaService) {}

  get modelName(): string {
    return 'Affiliates'; // Specify the Prisma model name for entity
  }

  async find(pageNumber: number, perPage: number): Promise<Affiliates[]> {
    const skipAmount = (pageNumber - 1) * perPage;

    return this.database.affiliates.findMany({
      include: { student: true },
      skip: skipAmount,
      take: perPage,
      orderBy: { id: 'desc' },
    });
  }

  async findById(id: number) {
    return this.database.affiliates.findFirst({
      include: { student: true },
      where: { id },
    });
  }

  async updateAffiliate(id: number, updateData: UpdateAffiliateDto): Promise<Affiliates> {
    const affiliate = await this.findById(id);

    if (!affiliate) throw new NotFoundException('Affiliate does not exist.');

    return this.database.affiliates.update({
      where: { id },
      data: updateData,
      include: { student: true },
    });
  }
}
