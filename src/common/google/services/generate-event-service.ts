import { Injectable, Logger } from '@nestjs/common';
import { Modules } from '@prisma/client';
import { GoogleCalendarService } from './google-calendar.service';
import { ModuleTierType } from 'src/common/constants/enum';
import { ModulesService } from '../../../modules/modules/services/modules.service';
import { delayMs } from 'src/common/helpers/date.helper';

@Injectable()
export class GenerateEventService {
  private readonly logger = new Logger(GenerateEventService.name);

  constructor(
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly modulesService: ModulesService
  ) {}

  async isEventExists(courseId: number, moduleTier: number, eventId: string) {
    const event = await this.googleCalendarService.getEvent(courseId, moduleTier, eventId);

    if (!event) return false;

    return true;
  }

  async createNewModuleEvent(upcomingModules: Modules[]) {
    const result = [];
    let updatedModule;

    for (const upcomingModule of upcomingModules) {
      const eventData = {
        courseId: upcomingModule.course_id,
        moduleTier: upcomingModule.tier,
        name: upcomingModule.name,
        description: upcomingModule.description,
        startTime: upcomingModule.start_date.toISOString(),
        endTime: upcomingModule.end_date.toISOString(),
      };

      const calendars = await this.googleCalendarService.getCalendars(eventData.courseId, eventData.moduleTier);

      const eventIdsToInsert = [];
      console.log('💡 ~ eventIdsToInsert BEFORE:', eventIdsToInsert);

      for (const calendar of calendars) {
        if (upcomingModule.tier !== ModuleTierType.ALL) {
          // Check the event is already exists
          const isEventExists = await this.isEventExists(
            upcomingModule.course_id,
            upcomingModule.tier,
            upcomingModule.event_id
          );

          if (isEventExists) continue; // continue to next upcoming module

          // Process if event is not existing to calendar
          const createdEvent = await this.googleCalendarService.createEvent(eventData, calendar.calendarId);
          updatedModule = await this.modulesService.updateModule(upcomingModule.id, { event_id: createdEvent.id });

          result.push(updatedModule);
        } else {
          if (!upcomingModule.event_id) {
            const createdEvent = await this.googleCalendarService.createEvent(eventData, calendar.calendarId);
            eventIdsToInsert.push(createdEvent.id);
          } else {
            const eventIds = upcomingModule.event_id.split('-');

            for (const eventId of eventIds) {
              const isEventExists = await this.isEventExists(upcomingModule.course_id, upcomingModule.tier, eventId);
              console.log('💡 ~ isEventExists:', isEventExists);
              if (!isEventExists) {
                const createdEvent = await this.googleCalendarService.createEvent(eventData, calendar.calendarId);
                eventIdsToInsert.push(createdEvent.id);
              }
            }
          }
        }
      }

      console.log('💡 ~ eventIdsToInsert: AFTER', eventIdsToInsert);
      const concatenatedEventIds = eventIdsToInsert.join('-');
      console.log('💡 ~ concatenatedEventIds:', concatenatedEventIds);
      updatedModule = await this.modulesService.updateModule(upcomingModule.id, {
        event_id: concatenatedEventIds,
      });

      result.push(updatedModule);

      await delayMs(1000);
    }

    return result;
  }
}
