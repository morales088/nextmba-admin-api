import { Injectable, Logger } from '@nestjs/common';
import { calendar_v3, google } from 'googleapis';
import { CalendarEvent } from '../interfaces/calendar-event.interface';
import { Calendar } from '../interfaces/calendar-data.interface';
import { OAuth2Client } from 'google-auth-library';
import { getStoredTokensPath } from 'src/common/helpers/path.helper';
import * as fs from 'fs';

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);
  private readonly oauth2Client: OAuth2Client;
  private readonly calendar: calendar_v3.Calendar;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
    });

    const storedTokens = this.loadStoredTokens(); 
    if (storedTokens) {
      this.oauth2Client.setCredentials(storedTokens);
    }

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    this.oauth2Client.on('tokens', (tokens) => {
      if (tokens.refresh_token) {
        this.storeTokens(tokens);
        this.logger.log('Refresh token used');
      }
      this.logger.log('New access token obtained');
    });
  }

  // Generates the URL for OAuth2 consent screen
  getAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/admin.directory.resource.calendar',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  // Exchange the authorization code for tokens
  async handleAuthCallback(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    this.storeTokens(tokens); // Store tokens when you first get them
  }

  private storeTokens(tokens: any) {
    fs.writeFileSync(getStoredTokensPath(), JSON.stringify(tokens));
  }

  private loadStoredTokens() {
    try {
      const tokens = fs.readFileSync(getStoredTokensPath(), 'utf-8');
      return JSON.parse(tokens);
    } catch (error) {
      this.logger.error('Error loading stored tokens', error);
      return null;
    }
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
      const calendarData = JSON.parse(fs.readFileSync(process.env.GOOGLE_CALENDAR_DATA_PATH, 'utf-8'));
      const allCalendars = calendarData.calendars;

      const findTiers = moduleTier === 3 ? [1, 2] : [moduleTier];

      const calendars = allCalendars.filter((calendar) => {
        return calendar.courseId === courseId && findTiers.includes(calendar.moduleTier);
      });

      return calendars;
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async getCalendarList() {
    try {
      const calendars = await this.calendar.calendarList.list();
      return calendars.data;
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

  async getEvent(calendarId: string, eventId: string) {
    try {
      const event = await this.calendar.events.get({
        calendarId: calendarId,
        eventId: eventId,
      });

      return event.data;
    } catch (error) {
      this.logger.error(`Error fetching event: ${eventId}, ${error.message}`);
      return null;
    }
  }

  async createEvent(eventData: CalendarEvent, calendarId: string) {
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
        requestBody: calendarEvent,
      });

      this.logger.log(`Event created: ${event.data.summary}`);
      return event.data;
    } catch (error) {
      this.logger.error(`Error creating event: ${error.message}`);
      return null
    }
  }

  async updateEvent(eventId: string, calendarId: string, eventData: CalendarEvent) {
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
        calendarId: calendarId,
        eventId: eventId,
        requestBody: calendarEvent,
      });

      this.logger.log(`Event updated: ${event.data.summary}`);
      return event.data;
    } catch (error) {
      this.logger.error(`Error updating event: ${error.message}`);
    }
  }

  async deleteEvent(calendarId: string, eventId: string): Promise<any> {
    try {
      await this.calendar.events.delete({
        calendarId: calendarId,
        eventId: eventId,
      });

      this.logger.log(`Event deleted: ${eventId}`);
      return { success: true, message: 'Event deleted successfully.' };
    } catch (error) {
      this.logger.error(`Error deleting event: ${error.message}`);
    }
  }
}
