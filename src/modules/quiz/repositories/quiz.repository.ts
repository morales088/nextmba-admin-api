import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Quiz } from '@prisma/client';

@Injectable()
export class QuizRepository extends AbstractRepository<Quiz> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Quiz'; // Specify the Prisma model name for entity
  }

  async find(): Promise<Quiz> {
    return this.prisma[this.modelName].findMany({
      where: { status: 1 },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  async insert(data: Partial<Quiz>): Promise<Quiz> {
    return this.prisma[this.modelName].create({ data });
  }

  // async updateSpeaker(id: number, data: UpdateSpeakerDto): Promise<Speakers> {
  //   const speaker = await this.findById(id);

  //   if (!speaker) {
  //     throw new BadRequestException('Speaker does not exist.');
  //   }

  //   return this.prisma[this.modelName].update({
  //     where: { id: id },
  //     data: data,
  //   });
  // }
}
