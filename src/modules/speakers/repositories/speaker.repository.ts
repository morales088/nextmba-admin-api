import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Speakers } from '@prisma/client';
import { UpdateSpeakerDto } from '../dto/update-speaker.dto';

@Injectable()
export class SpeakerRepository extends AbstractRepository<Speakers> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Speakers'; // Specify the Prisma model name for entity
  }

  async find(): Promise<Speakers> {
    return this.prisma[this.modelName].findMany({ where: { status: 1 } });
  }

  async insert(data: Partial<Speakers>): Promise<Speakers> {
    
    return this.prisma[this.modelName].create({ data });
  }

  async updateSpeaker(id: number, data: UpdateSpeakerDto): Promise<Speakers> {
    const speaker = await this.findById(id);
    
    if (!speaker) {
      throw new BadRequestException('Speaker does not exist.');
    }
    
    return this.prisma[this.modelName].update({
      where: { id : id },
      data: data,
    });
  }


}
