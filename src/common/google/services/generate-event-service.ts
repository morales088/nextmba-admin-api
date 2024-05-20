import { Injectable, Logger } from '@nestjs/common';
import { Modules } from '@prisma/client';
import { GoogleCalendarService } from './google-calendar.service';
import { ModuleTierType, ModuleType } from 'src/common/constants/enum';
import { ModulesService } from '../../../modules/modules/services/modules.service';
import { delayMs } from 'src/common/helpers/date.helper';

@Injectable()
export class GenerateEventService {
  private readonly logger = new Logger(GenerateEventService.name);

  constructor(
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly modulesService: ModulesService
  ) {}

  private createEventData(module: Modules) {
    return {
      courseId: module.course_id,
      moduleTier: module.tier,
      name: module.name,
      description: module.description,
      startTime: module.start_date.toISOString(),
      endTime: module.end_date.toISOString(),
    };
  }

  async isEventExists(calendarId: string, eventId: string): Promise<boolean> {
    if (!eventId) return false; // Return false if eventId is not provided

    try {
      const event = await this.googleCalendarService.getEvent(calendarId, eventId);
      return event !== null && event !== undefined; // Return true if event exists
    } catch (error) {
      console.error(`Error checking if event exists for calendarId: ${calendarId}, eventId: ${eventId}`, error);
      return false; // Return false if there is an error
    }
  }

  async createNewModuleEvent(upcomingModules: Modules[]) {
    const result = [];

    for (const upcomingModule of upcomingModules) {
      const eventData = this.createEventData(upcomingModule);
      const calendars = await this.googleCalendarService.getCalendars(eventData.courseId, eventData.moduleTier);
      const eventIdsToInsert = [];

      for (const calendar of calendars) {
        if (upcomingModule.tier !== ModuleTierType.ALL) {
          const eventExists = await this.isEventExists(calendar.calendarId, upcomingModule.event_id);

          if (!eventExists) {
            const createdEvent = await this.googleCalendarService.createEvent(eventData, calendar.calendarId);

            if (!createdEvent) {
              this.logger.error('Failed to create event');
              continue; // Skip to the next calendar if event creation failed
            }

            const updatedModule = await this.modulesService.updateModule(upcomingModule.id, {
              event_id: createdEvent.id,
            });

            result.push(updatedModule);
          } else {
            this.logger.log(`${upcomingModule.name} already exists in calendar`);
          }
        } else {
          if (upcomingModule.event_id) {
            await this.deleteExistingEvents(calendar.calendarId, upcomingModule.event_id);
          }

          const createdEvent = await this.googleCalendarService.createEvent(eventData, calendar.calendarId);

          if (!createdEvent) {
            this.logger.error('Failed to create event');
            continue; // Skip to the next calendar if event creation failed
          }

          eventIdsToInsert.push(createdEvent.id);
        }
      }

      if (upcomingModule.tier === ModuleTierType.ALL) {
        const concatenatedEventIds = eventIdsToInsert.join('-');
        const updatedModule = await this.modulesService.updateModule(upcomingModule.id, {
          event_id: concatenatedEventIds,
        });

        result.push(updatedModule);
      }

      this.logger.log('');
      await delayMs(10000);
    }

    this.logger.log('Generated events successfully!');
    return result;
  }

  async updateModuleCalendarEvent(module: Modules) {
    let moduleEventId: string | null = module.event_id;

    const eventData = this.createEventData(module);
    const calendars = await this.googleCalendarService.getCalendars(eventData.courseId, eventData.moduleTier);
    const eventIdsToInsert = [];

    for (const calendar of calendars) {
      if (module.tier !== ModuleTierType.ALL) {
        const eventExists = await this.isEventExists(calendar.calendarId, module.event_id);

        if (!eventExists) {
          const createdEvent = await this.googleCalendarService.createEvent(eventData, calendar.calendarId);

          if (!createdEvent) {
            this.logger.error('Failed to create event');
            continue; // Skip to the next calendar if event creation failed
          }

          moduleEventId = createdEvent.id;
        } else if (module.status !== ModuleType.DELETED && module.status !== ModuleType.DRAFT) {
          await this.googleCalendarService.updateEvent(module.event_id, calendar.calendarId, eventData);
        } else {
          await this.googleCalendarService.deleteEvent(calendar.calendarId, module.event_id);
          moduleEventId = null;
        }
      } else {
        if (module.event_id) {
          await this.deleteExistingEvents(calendar.calendarId, module.event_id);
        }

        const createdEvent = await this.googleCalendarService.createEvent(eventData, calendar.calendarId);

        if (!createdEvent) {
          this.logger.error('Failed to create event');
          continue; // Skip to the next calendar if event creation failed
        }

        eventIdsToInsert.push(createdEvent.id);
      }
    }

    if (module.tier === ModuleTierType.ALL) {
      const concatenatedEventIds = eventIdsToInsert.join('-');
      moduleEventId = concatenatedEventIds;
    }

    return moduleEventId;
  }

  async deleteExistingModuleEvents(module: Modules) {
    const calendars = await this.googleCalendarService.getCalendars(module.course_id, module.tier);
    if (module.event_id) {
      for (const calendar of calendars) {
        await this.deleteExistingEvents(calendar.calendarId, module.event_id);
      }
    }

    return true;
  }

  async deleteExistingEvents(calendarId: string, eventIds: string) {
    const eventIdArray = eventIds.split('-');
    for (const eventId of eventIdArray) {
      await this.googleCalendarService.deleteEvent(calendarId, eventId);
    }
  }
}
