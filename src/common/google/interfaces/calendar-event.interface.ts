export interface CalendarEvent {
  courseId: number,
  moduleTier: number,
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendees?: string[];
  reminders?: {
    useDefault: boolean;
    overrides?: {
      method: string;
      minutes: number;
    }[];
  };
}
