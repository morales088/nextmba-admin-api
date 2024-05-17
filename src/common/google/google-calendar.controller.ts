import { Body, Controller, Delete, Get, Logger, Param, Post, Put, Query, Redirect, Res } from '@nestjs/common';
import { GoogleCalendarService } from './services/google-calendar.service';
import { CalendarEvent } from './interfaces/calendar-event.interface';
import { Response } from 'express';

@Controller('calendar')
export class GoogleCalendarController {
  private readonly logger = new Logger(GoogleCalendarController.name);

  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  @Get('/auth')
  getAuthUrl(@Res() res: Response) {
    const url = this.googleCalendarService.getAuthUrl();
    return res.redirect(url);
  }

  @Get('/google/redirect')
  async handleCallback(@Query('code') code: string) {
    try {
      await this.googleCalendarService.handleAuthCallback(code);
      this.logger.log('Authentication successful!');
      return true;
    } catch (error) {
      this.logger.error(`Authentication failed: ${error.message}`);
    }
  }

  @Get('/list')
  async getCalendarList() {
    try {
      const calendars = await this.googleCalendarService.getCalendarList();
      return { success: true, calendars };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('/events')
  async getEvents(@Query('courseId') courseId: number, @Query('moduleTier') moduleTier: number) {
    try {
      const events = await this.googleCalendarService.getEvents(courseId, moduleTier);
      return { success: true, events };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post('/events/:calendarId')
  async createEvent(@Param('calendarId') calendarId: string, @Body() eventData: CalendarEvent) {
    try {
      const event = await this.googleCalendarService.createEvent(eventData, calendarId);
      return { success: true, event };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Put('events/:eventId/:calendarId')
  async updateEvent(
    @Param('eventId') eventId: string,
    @Param('calendarId') calendarId: string,
    @Body() eventData: CalendarEvent
  ) {
    try {
      const event = await this.googleCalendarService.updateEvent(eventId, calendarId, eventData);
      return { success: true, event };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Delete('events/:eventId')
  async deleteEvent(@Query('calendarId') calendarId: string, @Param('eventId') eventId: string) {
    try {
      const event = await this.googleCalendarService.deleteEvent(calendarId, eventId);
      return { success: true, event };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
