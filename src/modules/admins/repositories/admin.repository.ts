import { Injectable } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Users } from '@prisma/client';

@Injectable()
export class AdminRepository extends AbstractRepository<Users> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Users'; // Specify the Prisma model name for entity
  }

  async find(id: number) {
    return this.prisma[this.modelName].findFirst({ where: { id : id} });
  }

  async findAllAdmin() {
    return this.prisma[this.modelName].findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });
  }
}
