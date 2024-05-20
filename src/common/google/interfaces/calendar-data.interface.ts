import { ModuleTierType } from 'src/common/constants/enum';

export interface Calendar {
  name: string;
  courseId: number;
  moduleTier: ModuleTierType;
  calendarId: string;
}
