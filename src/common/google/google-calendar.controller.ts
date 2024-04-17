import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { GoogleCalendarService } from './services/google-calendar.service';
import { CalendarEvent } from './interfaces/calendar-event.interface';

@Controller('calendar')
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  @Post('/events')
  async createEvent(@Body() eventData: CalendarEvent) {
    try {
      const event = await this.googleCalendarService.createEvent(eventData);
      return { success: true, event };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Put('events/:eventId')
  async updateEvent(@Param('eventId') eventId: any, @Body() eventData: any) {
    try {
      const event = await this.googleCalendarService.updateEvent(eventId, eventData);
      return { success: true, event };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Delete('events/:eventId')
  async deleteEvent(@Param('eventId') eventId: any) {
    try {
      const event = await this.googleCalendarService.deleteEvent(eventId);
      return { success: true, event };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
