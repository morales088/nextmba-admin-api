import { BadRequestException, Injectable } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Students } from '@prisma/client';

@Injectable()
export class StudentRepository extends AbstractRepository<Students> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Students'; // Specify the Prisma model name for entity
  }

  async find(): Promise<Students> {
    return this.prisma[this.modelName].findMany({ where: { status: 1 }, include: { student_links: true }  });
  }

  async insert(data: Partial<Students>): Promise<Students> {

    const existingStudent = await this.prisma[this.modelName].findUnique({ where: { email : data.email } });

    if (existingStudent) {
      throw new BadRequestException('Student already exists.');
    }

    return this.prisma[this.modelName].create({ data: data });
  }

//   async updateModule(id: number, data: UpdateModuleDto): Promise<Modules> {
//     const module = await this.findById(id);
    
//     if (!module) {
//       throw new BadRequestException('Module does not exist.');
//     }
    
//     return this.prisma[this.modelName].update({
//       where: { id : id },
//       data: data,
//     });
//   }

    async findById(id: number) {
        return this.prisma[this.modelName].findUnique({ where: { id : id }, include: { student_links: true } });
      }
}
