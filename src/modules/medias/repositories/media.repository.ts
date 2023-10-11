import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Medias } from '@prisma/client';
import { UpdateMediaDto } from '../dto/update-media.dto';

@Injectable()
export class MediaRepository extends AbstractRepository<Medias> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Medias'; // Specify the Prisma model name for entity
  }

  async find(): Promise<Medias> {
    return this.prisma[this.modelName].findMany({ where: { status: 1 } });
  }

  async insert(data: Partial<Medias>): Promise<Medias> {
    
    const module = await this.prisma.modules.findUnique({ where: { id : data.module_id } });
    
    if (!module) {
      throw new BadRequestException('Module does not exist.');
    }
    
    const topic = await this.prisma.topics.findUnique({ where: { id : data.topic_id } });
    
    if (!topic) {
      throw new BadRequestException('Topic does not exist.');
    }
    
    return this.prisma[this.modelName].create({ data });
  }

  async updateMedia(id: number, data: UpdateMediaDto): Promise<Medias> {
    const media = await this.findById(id);
    
    if (!media) {
      throw new BadRequestException('Media does not exist.');
    }
    
    const topic = await this.prisma.topics.findUnique({ where: { id : data.topic_id } });

    if (!topic) {
      throw new BadRequestException('Topic does not exist.');
    }
    
    return this.prisma[this.modelName].update({
      where: { id : id },
      data: data,
    });
  }


}
