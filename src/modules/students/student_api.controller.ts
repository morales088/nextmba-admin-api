import { ApiKeyGuard } from "src/common/guards/api-key.guard";
import { StudentsService } from "./services/students.service";
import { Controller, UseGuards, Get } from "@nestjs/common";

@Controller('students_api')
@UseGuards(ApiKeyGuard)
export class StudentsApiController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('/count')
  async getStudentsCount() {
    const studentsCount = await this.studentsService.getActiveStudentsCount();

    return { studentsCount };
  }
}