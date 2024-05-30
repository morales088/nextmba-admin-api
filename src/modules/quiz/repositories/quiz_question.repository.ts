import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Quiz_questions } from '@prisma/client';

@Injectable()
export class QuizQuestionRepository extends AbstractRepository<Quiz_questions> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Quiz_questions'; // Specify the Prisma model name for entity
  }

  async findById(id: number): Promise<Quiz_questions> {
    return this.prisma[this.modelName].findFirst({
      include: {
        // quiz_questions : { where: { status: 1 } }
      },
      where: { id },
    });
  }

  async find(): Promise<Quiz_questions> {
    return this.prisma[this.modelName].findMany({
      where: { status: 1 },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  async insert(data: Partial<Quiz_questions>): Promise<Quiz_questions> {
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
