import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Topics } from '@prisma/client';
import { UpdateTopicDto } from '../dto/update-topic.dto';

@Injectable()
export class TopicsRepository extends AbstractRepository<Topics> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Topics'; // Specify the Prisma model name for entity
  }

  async find(): Promise<Topics> {
    return this.prisma[this.modelName].findMany({
      where: { status: 1 },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  async insert(data: Partial<Topics>): Promise<Topics> {
    const module = await this.prisma.modules.findUnique({ where: { id: data.module_id } });

    if (!module) {
      throw new BadRequestException('Module does not exist.');
    }

    const speaker = await this.prisma.speakers.findUnique({ where: { id: data.speaker_id } });

    if (!speaker) {
      throw new BadRequestException('Speaker does not exist.');
    }

    return this.prisma[this.modelName].create({ data });
  }

  async updateTopic(id: number, data: UpdateTopicDto): Promise<Topics> {
    const topic = await this.findById(id);

    if (!topic) {
      throw new BadRequestException('topic does not exist.');
    }

    const speaker = await this.prisma.speakers.findUnique({ where: { id: data.speaker_id } });

    if (!speaker) {
      throw new BadRequestException('Speaker does not exist.');
    }

    if (data.main_topic == 1) { // update main topic to 0 per module
      await this.prisma[this.modelName].updateMany({
        where: { module_id: data.module_id },
        data: { main_topic: 0 },
      });
    }

    return this.prisma[this.modelName].update({
      where: { id: id },
      data: data,
    });
  }

  async findByModuleId(moduleId: number) {
    return await this.prisma[this.modelName].findMany({
      where: { module_id: moduleId, status: 1 },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  // get highest topic position per module
  async libraryPosition(moduleId: number): Promise<Topics> {
    return await this.prisma[this.modelName].aggregate({
      // where: { module_id: moduleId, status: 1 },
      where: { status: 1 },
      _max: {
        library_position: true,
      },
    });
  }
}
