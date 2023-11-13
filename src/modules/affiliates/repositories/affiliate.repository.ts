import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Affiliates, Files } from '@prisma/client';
import { UpdateAffiliateDto } from '../dto/update-affiliate.dto';

@Injectable()
export class AffiliateRepository extends AbstractRepository<Affiliates> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Affiliates'; // Specify the Prisma model name for entity
  }

  async find(): Promise<Affiliates> {
    return this.prisma[this.modelName].findMany({
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  async updateAffiliate(id: number, data: UpdateAffiliateDto): Promise<Affiliates> {
    const affiliate = await this.findById(id);

    if (!affiliate) {
      throw new BadRequestException('affiliate does not exist.');
    }

    return this.prisma[this.modelName].update({
      where: { id: id },
      data: data,
    });
  }
}
