import { BadRequestException, Global, Injectable } from '@nestjs/common';
import { getCourseGroupMappingFolderPath } from '../helpers/path.helper';
import * as fs from 'fs';

@Global()
@Injectable()
export class CourseGroupService {
  private readonly filePath: string;
  private courseGroupMapping: { [key: string]: string };

  constructor() {
    this.filePath = getCourseGroupMappingFolderPath('course-mapping.json');
    this.readMappingFromFile();
  }

  private readMappingFromFile(): void {
    const fileContent = fs.readFileSync(this.filePath, 'utf-8');
    this.courseGroupMapping = JSON.parse(fileContent);
  }

  private writeMappingToFile(): void {
    const jsonContent = JSON.stringify(this.courseGroupMapping, null, 2);
    fs.writeFileSync(this.filePath, jsonContent, 'utf-8');
  }

  addMapping(courseId: string, groupId: string): void {
    if (this.courseGroupMapping.hasOwnProperty(courseId)) {
      throw new BadRequestException(`Key "${courseId}" already exists.`)
    }

    this.courseGroupMapping[courseId] = groupId;
    this.writeMappingToFile();
  }

  getCourseGroupMapping(): { [key: string]: string } {
    return this.courseGroupMapping;
  }
}
