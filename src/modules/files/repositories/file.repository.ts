import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Files } from '@prisma/client';
import { UpdateFileDto } from '../dto/update-file.dto';

@Injectable()
export class FileRepository extends AbstractRepository<Files> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Files'; // Specify the Prisma model name for entity
  }

  async find(): Promise<Files> {
    return this.prisma[this.modelName].findMany({ where: { status: 1 } });
  }

  async insert(data: Partial<Files>): Promise<Files> {
    
    const topic = await this.prisma.topics.findUnique({ where: { id : data.topic_id } });
    
    if (!topic) {
      throw new BadRequestException('Topic does not exist.');
    }
    
    return this.prisma[this.modelName].create({ data });
  }

  async updateFile(id: number, data: UpdateFileDto): Promise<Files> {
    const file = await this.findById(id);
    
    if (!file) {
      throw new BadRequestException('file does not exist.');
    }
    
    return this.prisma[this.modelName].update({
      where: { id : id },
      data: data,
    });
  }

}
