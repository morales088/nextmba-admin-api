import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { UpdateAffiliateDto } from '../dto/update-affiliate.dto';
import { Affiliates } from '@prisma/client';

@Injectable()
export class AffiliateRepository extends AbstractRepository<Affiliates> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Affiliates'; // Specify the Prisma model name for entity
  }

  async find(pageNumber: number, perPage: number): Promise<Affiliates[]> {
    const skipAmount = (pageNumber - 1) * perPage;

    return this.prisma.affiliates.findMany({
      include: { student: true },
      skip: skipAmount,
      take: perPage,
      orderBy: { id: 'desc' },
    });
  }

  async findById(id: number) {
    return this.prisma.affiliates.findFirst({
      include: { student: true },
      where: { id },
    });
  }

  async updateAffiliate(id: number, updateData: UpdateAffiliateDto): Promise<Affiliates> {
    const affiliate = await this.findById(id);

    if (!affiliate) throw new NotFoundException('Affiliate does not exist.');

    return this.prisma.affiliates.update({
      where: { id },
      data: updateData,
      include: { student: true },
    });
  }
}
