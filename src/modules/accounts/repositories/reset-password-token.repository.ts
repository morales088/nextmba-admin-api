import { Injectable } from '@nestjs/common';
import { ResetPasswordToken } from '@prisma/client';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class ResetPasswordTokenRepository extends AbstractRepository<ResetPasswordToken> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'resetPasswordToken'; // Specify the Prisma model name for User entity
  }

  async findTokenOwner(token: string) {
    return this.prisma[this.modelName].findFirst({ where: { token } });
  }
}
