import { Injectable } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Users } from '@prisma/client';

@Injectable()
export class UserRepository extends AbstractRepository<Users> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Users'; // Specify the Prisma model name for entity
  }

  async findActiveUsers() {
    return this.prisma[this.modelName].findMany({ where: { status: 1 } });
  }

  async findUserWithPassword(email: string) {
    return this.prisma[this.modelName].findUnique({ where: { email } });
  }

  async updatePassword(id: number, password: string) {
    return this.prisma[this.modelName].update({
      where: { id },
      data: {
        password,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma[this.modelName].findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
