import { Injectable } from '@nestjs/common';
import { Certificates, Courses } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';

@Injectable()
export class CertificateRepository extends AbstractRepository<Certificates> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Certificates'; // Specify the Prisma model name for Courses entity
  }

  async activeCertificates() {
    return this.prisma[this.modelName].findMany({
      where: { status: 1 },
      orderBy: { id: 'asc' },
    });
  }

  async certificate(tier: number = 1) {
    return this.prisma[this.modelName].findFirst({
      where: { certificate_tier : tier },
    });
  }
}
