import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ModulesService } from './services/modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { AwsS3Service } from 'src/common/aws/aws_s3.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { GoogleCalendarService } from 'src/common/google/services/google-calendar.service';
import { ModuleType } from 'src/common/constants/enum';
import { ModuleTierType } from '../../common/constants/enum';
import { delayMs } from 'src/common/helpers/date.helper';

@Controller('modules')
@UseGuards(AuthGuard('jwt'))
export class ModulesController {
  constructor(
    private readonly modulesService: ModulesService,
    private readonly awsS3Service: AwsS3Service,
    private readonly googleCalendarService: GoogleCalendarService
  ) {}

  @Get('/:moduleId')
  async getModule(@Param('moduleId') moduleId: number) {
    return await this.modulesService.getModule(moduleId);
  }

  @Get('/')
  async getModules(
    @Query('search') search?: string,
    @Query('course') course?: number,
    @Query('status') status?: number,
    @Query('page_number') page_number?: number,
    @Query('per_page') per_page?: number
  ) {
    const pageNumber = page_number ? page_number : 1;
    const perPage = per_page ? per_page : 10;

    const filterData = {
      search,
      course,
      status,
    };

    return await this.modulesService.getModules(filterData, pageNumber, perPage);
  }

  @Post('/')
  async createModule(@Body() createModuleDto: CreateModuleDto) {
    const moduleData = {
      ...createModuleDto,
    };

    return await this.modulesService.createModules(moduleData);
  }

  @Put('/:moduleId')
  async updateModule(@Param('moduleId') moduleId: number, @Body() updateModuleDto: UpdateModuleDto) {
    let updatedModule = await this.modulesService.updateModule(moduleId, updateModuleDto);

    const moduleEvent = await this.googleCalendarService.updateModuleCalendarEvent(updatedModule);
    const eventId = moduleEvent !== null ? moduleEvent.id : null;

    updatedModule = await this.modulesService.updateModule(updatedModule.id, { event_id: eventId });

    return updatedModule;
  }

  @Post('/upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' })],
      })
    )
    file: Express.Multer.File
  ) {
    const path = 'images/courses_cover';

    if (file.size > 100000000) {
      // more than 100mb
      const fileUrl = await this.awsS3Service.uploadBigfile(path, file);
      return { fileUrl };
    } else {
      const fileUrl = await this.awsS3Service.uploadSmallFile(path, file);
      return { fileUrl };
    }
  }

  @Post('/generate-events')
  async generateEventsForUpcomingModules() {
    const upcomingModules = await this.modulesService.getUpcomingModules();

    const result: any[] = [];

    for (const upcomingModule of upcomingModules) {
      const eventData = {
        courseId: upcomingModule.course_id,
        moduleTier: upcomingModule.tier,
        name: upcomingModule.name,
        description: upcomingModule.description,
        startTime: upcomingModule.start_date.toISOString(),
        endTime: upcomingModule.end_date.toISOString(),
      };

      let updatedModule;

      const calendar = await this.googleCalendarService.getCalendar(eventData.courseId, eventData.moduleTier);

      if (upcomingModule.tier !== ModuleTierType.ALL) {
        const isEventExists =
          upcomingModule.event_id !== null
            ? await this.googleCalendarService.getEvent(
                upcomingModule.course_id,
                upcomingModule.tier,
                upcomingModule.event_id
              )
            : false;

        if (!isEventExists) {
          const createdEvent = await this.googleCalendarService.createEvent(eventData, calendar.calendarId);
          updatedModule = await this.modulesService.updateModule(upcomingModule.id, { event_id: createdEvent.id });
          console.log('💡 ~ updatedModule:', updatedModule);

          result.push(updatedModule);
        }
      } else {
        if (upcomingModule.event_id !== null) {
          const eventIds = upcomingModule.event_id.split('-');
          console.log('💡 ~ evenIds:', eventIds);

          const newlyCreatedEventIds = [];
          for (const eventId of eventIds) {
            const isEventExists =
              upcomingModule.event_id !== null
                ? await this.googleCalendarService.getEvent(upcomingModule.course_id, upcomingModule.tier, eventId)
                : false;

            if (!isEventExists) {
              const createdEvent = await this.googleCalendarService.createEvent(eventData, calendar.calendarId);
              newlyCreatedEventIds.push(createdEvent.id);
            }

            const concatenatedEventId = newlyCreatedEventIds.join('-');
            updatedModule = await this.modulesService.updateModule(upcomingModule.id, {
              event_id: concatenatedEventId,
            });

            result.push(updatedModule);
          }
        } else {
          const calendars = await this.googleCalendarService.getCalendars(
            upcomingModule.course_id,
            upcomingModule.tier
          );

          const newlyCreatedEventIds = [];
          for (const calendar of calendars) {
            const createdEvent = await this.googleCalendarService.createEvent(eventData, calendar.calendarId);
            newlyCreatedEventIds.push(createdEvent.id);
          }

          const concatenatedEventId = newlyCreatedEventIds.join('-');
          updatedModule = await this.modulesService.updateModule(upcomingModule.id, {
            event_id: concatenatedEventId,
          });

          result.push(updatedModule);
        }
      }

      await delayMs(1000);
    }

    return result;
  }
}
