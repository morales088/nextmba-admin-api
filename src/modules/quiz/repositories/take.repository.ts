import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Takes } from '@prisma/client';

@Injectable()
export class TakeRepository extends AbstractRepository<Takes> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Takes'; // Specify the Prisma model name for entity
  }

  async findById(id: number): Promise<Takes> {
    return this.prisma[this.modelName].findFirst({
      include: {
        // quiz_questions : { where: { status: 1 } }
      },
      where: { id },
    });
  }

  async find(): Promise<Takes> {
    return this.prisma[this.modelName].findMany({
      where: { status: 1 },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  async findByQuiz(quizId: number): Promise<Takes> {
    return this.prisma[this.modelName].findFirst({
      include: {
        take_answers: { where: { status: 1 } },
      },
      where: { quiz_id: quizId, status: 1 },
    });
  }

  async insert(data: Partial<Takes>): Promise<Takes> {
    return this.prisma[this.modelName].create({ data });
  }

  async updateTake(id: number, data: any): Promise<Takes> {
    const take = await this.findById(id);

    if (!take) {
      throw new BadRequestException('take does not exist.');
    }

    return this.prisma[this.modelName].update({
      where: { id: id },
      data: data,
    });
  }

  async submissionsPerQuiz(quizId) {
    const quizAttempts = await this.prisma.takes.groupBy({
      by: ['student_id'],
      where: {
        quiz_id: quizId,
      },
      _count: {
        _all: true,
      },
      _max: {
        score: true,
        status: true
      }
    });

    const studentIds = quizAttempts.map((attempt) => attempt.student_id);
    const students = await this.prisma.students.findMany({
      where: {
        id: { in: studentIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const studentMap = Object.fromEntries(
      students.map((student) => [student.id, { name: student.name, email: student.email }])
    );

    const attemptsSummary = quizAttempts.map((attempt) => ({
      student_id: attempt.student_id,
      student_name: studentMap[attempt.student_id].name,
      student_email: studentMap[attempt.student_id].email,
      attempts: attempt._count._all,
      passed: attempt._max.status >= 2,
      score: attempt._max.score,
    }));
  
    return attemptsSummary;
  }
}
