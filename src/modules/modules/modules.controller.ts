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

    const eventData = {
      name: updatedModule.name,
      description: updatedModule.description,
      startTime: updatedModule.start_date.toISOString(),
      endTime: updatedModule.end_date.toISOString(),
    };

    const isEventExists =
      updatedModule.event_id !== null ? await this.googleCalendarService.getEvent(updatedModule.event_id) : false;

    if (!isEventExists) {
      const createdEvent = await this.googleCalendarService.createEvent(eventData);
      updatedModule = await this.modulesService.updateModule(updatedModule.id, { event_id: createdEvent.id });
    }

    const { DELETED, DRAFT } = ModuleType;
    
    if (updatedModule.status !== DELETED && updatedModule.status !== DRAFT) {
      await this.googleCalendarService.updateEvent(updatedModule.event_id, eventData);
    } else {
      this.googleCalendarService.deleteEvent(updatedModule.event_id);
      updatedModule = await this.modulesService.updateModule(updatedModule.id, { event_id: null });
    }

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
        name: upcomingModule.name,
        description: upcomingModule.description,
        startTime: upcomingModule.start_date.toISOString(),
        endTime: upcomingModule.end_date.toISOString(),
      };

      let updatedModule;

      const isEventExists =
        upcomingModule.event_id !== null ? await this.googleCalendarService.getEvent(upcomingModule.event_id) : false;

      if (!isEventExists) {
        const createdEvent = await this.googleCalendarService.createEvent(eventData);
        updatedModule = await this.modulesService.updateModule(upcomingModule.id, { event_id: createdEvent.id });

        result.push(updatedModule);
      }
    }

    return result;
  }
}
