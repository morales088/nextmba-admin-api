import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import * as fs from 'fs';
import { CalendarEvent } from '../interfaces/calendar-event.interface';

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);

  private readonly calendarId = process.env.GOOGLE_CALENDAR_ID;
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

  async getEvents() {
    try {
      const events = await this.calendar.events.list({
        calendarId: this.calendarId,
      });

      return events.data;
    } catch (error) {
      this.logger.error(`Error fetching events: ${error.message}`);
      throw error;
    }
  }

  async getEvent(eventId: string) {
    try {
      const event = await this.calendar.events.get({
        calendarId: this.calendarId,
        eventId: eventId,
      });

      return event.data;
    } catch (error) {
      this.logger.error(`Error fetching events: ${error.message}`);
      throw error;
    }
  }

  async createEvent(eventData: CalendarEvent): Promise<any> {
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
        calendarId: this.calendarId,
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
        calendarId: this.calendarId,
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

  async deleteEvent(eventId: string): Promise<any> {
    try {
      await this.calendar.events.delete({
        calendarId: this.calendarId,
        eventId: eventId,
      });

      this.logger.log(`Event deleted: ${eventId}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error deleting event: ${error.message}`);
      throw error;
    }
  }
}
