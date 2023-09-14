import { Injectable } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserRepository extends AbstractRepository<User> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'User'; // Specify the Prisma model name for entity
  }

  async findUserWithPassword(email: string) {
    return this.prisma[this.modelName].findUnique({ where: { email } });
  }

  async findByEmail(email: string) {
    return this.prisma[this.modelName].findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }
}
