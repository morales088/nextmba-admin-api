import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Student_certificates } from '@prisma/client';
import { UpdateCertificateDto } from '../dto/update-certificate.dto';

@Injectable()
export class StudentCertificateRepository extends AbstractRepository<Student_certificates> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Student_certificates'; // Specify the Prisma model name for entity
  }

  async find(): Promise<Student_certificates> {
    return this.prisma[this.modelName].findMany({
      where: { status: { in: [1, 2, 3] } },
      include: { student: true },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  async findById(id: number) {
    return this.prisma[this.modelName].findFirst({
      include: { student: true, course: true },
      where: { id },
    });
  }

  async insert(data: Partial<Student_certificates>): Promise<Student_certificates> {
    const studCourse = await this.prisma.student_courses.findFirst({
      where: {
        student_id: data.student_id,
        course_id: data.course_id,
        status: 1,
      },
    });

    if (!studCourse) {
      throw new BadRequestException('Student not enrolled to this course.');
    }

    const studCertificate = await this.prisma.student_certificates.findFirst({
      where: {
        student_id: data.student_id,
        course_id: data.course_id,
        certificate_tier: data.certificate_tier,
      },
    });

    if (studCertificate) {
      throw new BadRequestException('Student has entry to this course and tier.');
    }

    return this.prisma[this.modelName].create({ data });
  }

  async findByCode(code: string) {
    return this.prisma[this.modelName].findFirst({
      where: { certificate_code: code, status: 2 },
      include: {
        student: true,
        module: { include: { topics: { where: { type: { in: [1, 4] }, status: 1 }, include: { speaker: true } } } },
      },
    });
  }

  async updateCertificate(id: number, data: any): Promise<Student_certificates> {
    const certificate = await this.findById(id);

    if (!certificate) {
      throw new BadRequestException('certificate does not exist.');
    }

    if (data.status == 2 && certificate.certificate_code == null) {
      data.certificate_code = this.generateRandomString(32);
    }

    return this.prisma[this.modelName].update({
      where: { id: id },
      data: data,
      include: { student: true, course: true },
    });
  }

  generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
