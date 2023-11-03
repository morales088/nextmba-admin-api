import { BadRequestException, Injectable } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Modules } from '@prisma/client';
import { UpdateModuleDto } from '../dto/update-module.dto';

@Injectable()
export class ModuleRepository extends AbstractRepository<Modules> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Modules'; // Specify the Prisma model name for entity
  }

  async find(): Promise<Modules> {
    return this.prisma[this.modelName].findMany({ where: { status: 1 } });
  }

  async insert(data: Partial<Modules>): Promise<Modules> {
    const course = await this.prisma.courses.findUnique({ where: { id : data.course_id } });
    
    if (!course) {
      throw new BadRequestException('Course does not exist.');
    }
    
    return this.prisma[this.modelName].create({ data });
  }

  async updateModule(id: number, data: UpdateModuleDto): Promise<Modules> {
    const module = await this.findById(id);
    if (!module) {
      throw new BadRequestException('Module does not exist.');
    }
    
    return this.prisma[this.modelName].update({
      where: { id : id },
      data: data,
    });
  }
}
