export interface CalendarEvent {
  courseId: number,
  moduleTier: number,
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendees?: string[]; // Array of attendee email addresses
  reminders?: {
    useDefault: boolean;
    overrides?: {
      method: string;
      minutes: number;
    }[];
  };
}
