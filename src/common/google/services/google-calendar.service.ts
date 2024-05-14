import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import * as fs from 'fs';
import { CalendarEvent } from '../interfaces/calendar-event.interface';
import { Calendar } from '../interfaces/calendar-data.interface';
import { Modules } from '@prisma/client';
import { ModuleType } from 'src/common/constants/enum';

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);
  private readonly calendar;

  constructor() {
    const fileKey = fs.readFileSync(process.env.GOOGLE_CALENDAR_KEY_PATH, 'utf-8');
    const credentials = JSON.parse(fileKey);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    this.calendar = google.calendar({ version: 'v3', auth: auth });
  }

  async getCalendar(courseId: number, moduleTier: number) {
    try {
      const calendarData = JSON.parse(fs.readFileSync(process.env.GOOGLE_CALENDAR_DATA_PATH, 'utf-8'));
      const calendars: Calendar[] = calendarData.calendars;

      const calendar = calendars.find((calendar) => {
        return calendar.courseId === courseId && calendar.moduleTier === moduleTier;
      });

      return calendar;
    } catch (error) {
      this.logger.error('Error occurred getting calendar', error.message);
    }
  }

  async getCalendars(courseId: number, moduleTier: number) {
    try {
      const calendarData = JSON.parse(fs.readFileSync(process.env.GOOGLE_CALENDAR_KEY_PATH, 'utf-8'));
      const allCalendars: Calendar[] = calendarData.calendars;

      const calendars = allCalendars.filter((calendar) => {
        return calendar.courseId === courseId && calendar.moduleTier === moduleTier;
      });

      return calendars;
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async getEvents(courseId: number, moduleTier: number) {
    try {
      const calendar = await this.getCalendar(courseId, moduleTier);

      const events = await this.calendar.events.list({
        calendarId: calendar.calendarId,
      });

      return events.data;
    } catch (error) {
      this.logger.error(`Error fetching events: ${error.message}`);
      throw error;
    }
  }

  async getEvent(courseId: number, moduleTier: number, eventId: string) {
    try {
      const calendar = await this.getCalendar(courseId, moduleTier);

      const event = await this.calendar.events.get({
        calendarId: calendar.calendarId,
        eventId: eventId,
      });

      return event.data;
    } catch (error) {
      this.logger.error(`Error fetching event: ${error.message}`);
    }
  }

  async createEvent(eventData: CalendarEvent, calendarId: string): Promise<any> {
    const calendarEvent = {
      summary: eventData.name,
      description: eventData.description,
      start: { dateTime: eventData.startTime, timeZone: 'UTC' },
      end: { dateTime: eventData.endTime, timeZone: 'UTC' },
      attendees: [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 30 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    try {
      const event = await this.calendar.events.insert({
        calendarId: calendarId,
        resource: calendarEvent,
      });

      this.logger.log(`Event created: ${event.data.summary}`);
      return event.data;
    } catch (error) {
      this.logger.error(`Error creating event: ${error.message}`);
      throw error;
    }
  }

  async updateEvent(eventId: string, eventData: CalendarEvent): Promise<any> {
    const calendar = await this.getCalendar(eventData.courseId, eventData.moduleTier);

    const calendarEvent = {
      summary: eventData.name,
      description: eventData.description,
      start: {
        dateTime: eventData.startTime,
        timeZone: 'UTC',
      },
      end: {
        dateTime: eventData.endTime,
        timeZone: 'UTC',
      },
    };

    try {
      const event = await this.calendar.events.update({
        calendarId: calendar.calendarId,
        eventId: eventId,
        requestBody: calendarEvent,
      });

      this.logger.log(`Event updated: ${event.data.htmlLink}`);
      return event.data;
    } catch (error) {
      this.logger.error(`Error updating event: ${error.message}`);
      throw error;
    }
  }

  async deleteEvent(courseId: number, moduleTier: number, eventId: string): Promise<any> {
    try {
      const calendar = await this.getCalendar(courseId, moduleTier);

      await this.calendar.events.delete({
        calendarId: calendar.calendarId,
        eventId: eventId,
      });

      this.logger.log(`Event deleted: ${eventId}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error deleting event: ${error.message}`);
      throw error;
    }
  }

  async updateModuleCalendarEvent(module: Modules) {
    let moduleEvent;

    const eventData = {
      courseId: module.course_id,
      moduleTier: module.tier,
      name: module.name,
      description: module.description,
      startTime: module.start_date.toISOString(),
      endTime: module.end_date.toISOString(),
    };

    const isEventExists =
      module.event_id !== null ? await this.getEvent(module.course_id, module.tier, module.event_id) : false;

    const calendar = await this.getCalendar(eventData.courseId, eventData.moduleTier);

    if (!isEventExists) {
      const createdEvent = await this.createEvent(eventData, calendar.calendarId);
      moduleEvent = createdEvent;
    }

    const { DELETED, DRAFT } = ModuleType;

    if (module.status !== DELETED && module.status !== DRAFT) {
      await this.updateEvent(module.event_id, eventData);
    } else {
      this.deleteEvent(module.course_id, module.tier, module.event_id);
      moduleEvent = null;
    }

    return moduleEvent;
  }
}
