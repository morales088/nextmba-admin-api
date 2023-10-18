import { BadRequestException, Injectable } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Payments } from '@prisma/client';

@Injectable()
export class PaymentRepository extends AbstractRepository<Payments> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Payments'; // Specify the Prisma model name for entity
  }

  async find(): Promise<Payments> {
    return this.prisma[this.modelName].findMany({ where: { status: 1 }, include: { payment_items: true } });
  }

//   async insert(data: Partial<Modules>): Promise<Modules> {
//     const course = await this.prisma.courses.findUnique({ where: { id : data.course_id } });
    
//     if (!course) {
//       throw new BadRequestException('Course does not exist.');
//     }
    
//     return this.prisma[this.modelName].create({ data });
//   }

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
      return this.prisma[this.modelName].findUnique({ where: { id : id }, include: { payment_items: true } });
    }
}
