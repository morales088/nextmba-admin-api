import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Answers } from '@prisma/client';
import { UpdateAnswerDto } from '../dto/update-answer.dto';

@Injectable()
export class AnswerRepository extends AbstractRepository<Answers> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Answers'; // Specify the Prisma model name for entity
  }

  async find(): Promise<Answers> {
    return this.prisma[this.modelName].findMany({
      where: { status: 1 },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  async insert(data: Partial<Answers>): Promise<Answers> {
    return this.prisma[this.modelName].create({ data });
  }

  async updateAnswer(id: number, data: UpdateAnswerDto): Promise<Answers> {
    const answer = await this.findById(id);

    if (!answer) {
      throw new BadRequestException('answer does not exist.');
    }

    return this.prisma[this.modelName].update({
      where: { id: id },
      data: data,
    });
  }
}
