import { Injectable, Logger } from '@nestjs/common';
import { processAndRemoveEntries } from 'src/common/helpers/csv.helper';
import { UpdateStudentCourseDto } from 'src/modules/students/dto/update-studentCourse.dto';
import { StudentsService } from 'src/modules/students/services/students.service';

@Injectable()
export class CourseTierCronService {
  private readonly logger = new Logger(CourseTierCronService.name);

  constructor(private readonly studentService: StudentsService) {}

  async updateStudentCourseTier() {
    try {
      const emailRowData = await processAndRemoveEntries('student-courses-tier.csv', 1000);

      if (!Array.isArray(emailRowData) || emailRowData.length === 0) {
        this.logger.debug(`No data to process in CSV.`);
        return;
      }

      // Create a Set to store unique emails
      const uniqueEmails = new Set<string>();

      // Flatten the emailRowData and add unique emails to the Set
      emailRowData.flat().forEach((email) => uniqueEmails.add(email));

      // Convert the Set back to an array of unique emails
      const uniqueEmailArray = Array.from(uniqueEmails);

      for (const email of uniqueEmailArray) {
        const student = await this.studentService.getStudentByEmail(email);

        if (!student || !student.student_courses) {
          this.logger.debug(`Unable to process student courses. ${email}`);
          continue;
        }

        for (const student_course of student.student_courses) {
          const updateCourseData = {
            course_tier: 2,
          } as UpdateStudentCourseDto;

          try {
            await this.studentService.updateStudentCourse(student_course.id, updateCourseData);
          } catch (error) {
            this.logger.error('Error updating student course:', error);
            continue;
          }
        }
        this.logger.log(`Student ${email} updated successfully`);
      }
    } catch (error) {
      this.logger.error('Error processing student course tier update:', error);
    }
  }
}
