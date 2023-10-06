import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Translations } from '@prisma/client';
import { UpdateTranslationDto } from '../dto/update-translation.dto';

@Injectable()
export class TranslationRepository extends AbstractRepository<Translations> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Translations'; // Specify the Prisma model name for entity
  }

  async find(): Promise<Translations> {
    return this.prisma[this.modelName].findMany({ where: { status: 1 } });
  }

  async insert(data: Partial<Translations>): Promise<Translations> {
    
    const module = await this.prisma.modules.findUnique({ where: { id : data.module_id } });
    
    if (!module) {
      throw new BadRequestException('Module does not exist.');
    }
    
    return this.prisma[this.modelName].create({ data });
  }

  async updateTranslation(id: number, data: UpdateTranslationDto): Promise<Translations> {
    const translation = await this.findById(id);
    
    if (!translation) {
      throw new BadRequestException('translation does not exist.');
    }
    
    return this.prisma[this.modelName].update({
      where: { id : id },
      data: data,
    });
  }


}
