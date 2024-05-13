import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { GoogleCalendarService } from './services/google-calendar.service';
import { CalendarEvent } from './interfaces/calendar-event.interface';

@Controller('calendar')
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  @Get('/events')
  async getEvents(@Query('courseId') courseId: number, @Query('moduleTier') moduleTier: number) {
    try {
      const events = await this.googleCalendarService.getEvents(courseId, moduleTier);
      return { success: true, events };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

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
  async updateEvent(@Param('eventId') eventId: any, @Body() eventData: CalendarEvent) {
    try {
      const event = await this.googleCalendarService.updateEvent(eventId, eventData);
      return { success: true, event };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Delete('events/:eventId')
  async deleteEvent(
    @Param('eventId') eventId: string,
    @Query('courseId') courseId: number,
    @Query('moduleTier') moduleTier: number
  ) {
    try {
      const event = await this.googleCalendarService.deleteEvent(courseId, moduleTier, eventId);
      return { success: true, event };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
