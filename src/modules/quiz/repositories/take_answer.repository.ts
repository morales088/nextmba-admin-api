import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Take_answers } from '@prisma/client';

@Injectable()
export class TakeAnswerRepository extends AbstractRepository<Take_answers> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Take_answers'; // Specify the Prisma model name for entity
  }

  async findById(id: number): Promise<Take_answers> {
    return this.prisma[this.modelName].findFirst({
      include: {
        // quiz_questions : { where: { status: 1 } }
      },
      where: { id },
    });
  }

  async find(): Promise<Take_answers> {
    return this.prisma[this.modelName].findMany({
      where: { status: 1 },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  async insert(data: Partial<Take_answers>): Promise<Take_answers> {
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
