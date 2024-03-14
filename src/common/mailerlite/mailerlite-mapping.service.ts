import { BadRequestException, Global, Injectable } from '@nestjs/common';
import { getMailerliteMappingFolderPath } from '../helpers/path.helper';
import * as fs from 'fs';

interface CourseMapping {
  subscribersGroup: { [key: string]: string };
  startDateField: { [key: string]: string };
}

type MappingType = 'subscriberGroup' | 'startDateField';

@Global()
@Injectable()
export class MailerliteMappingService {
  private readonly filePath: string;
  private courseGroupMapping: CourseMapping;

  constructor() {
    this.filePath = getMailerliteMappingFolderPath('mailerlite-mapping.json');
    this.readMappingFromFile();
  }

  private readMappingFromFile(): void {
    const fileContent = fs.readFileSync(this.filePath, 'utf-8');
    this.courseGroupMapping = JSON.parse(fileContent) as CourseMapping;
  }

  private writeMappingToFile(): void {
    const jsonContent = JSON.stringify(this.courseGroupMapping, null, 2);
    fs.writeFileSync(this.filePath, jsonContent, 'utf-8');
  }

  addMapping(mappingType: MappingType, courseId: string, value: string): void {
    if (this.courseGroupMapping[mappingType].hasOwnProperty(courseId)) {
      throw new BadRequestException(`Key "${courseId}" already exists in ${mappingType}.`);
    }

    this.courseGroupMapping[mappingType][courseId] = value;
    this.writeMappingToFile();
  }

  getMapping(mappingType: MappingType): { [key: string]: string } | undefined {
    return this.courseGroupMapping[mappingType];
  }
}
