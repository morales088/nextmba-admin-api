import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MeetingsService } from './services/meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { ZoomService } from 'src/common/utils/zoom.service';
import { Response } from 'express';

@Controller('meetings')
@UseGuards(AuthGuard('jwt'))
export class MeetingsController {
  constructor(
    private readonly meetingsService: MeetingsService,
    private readonly zoomService: ZoomService
  ) {}

  @Get('/')
  async getMeetings() {
    try {
      const meetings = await this.zoomService.getMeetings();
      return meetings;
    } catch (error) {
      console.error('Error fetching meetings:', error.response?.data || error.message);
      throw new Error('Failed to fetch meetings');
    }
  }

  @Post('/start')
  async createMeeting(@Body() createMeetingDto: CreateMeetingDto, @Res() res: Response) {
    const meeting = {
      ...createMeetingDto,
      type: 2,
    };

    // if module has live id
    const module = await this.meetingsService.getModule(meeting.module_id);

    if (!!module.live_link) return res.status(HttpStatus.BAD_REQUEST).json({ message: 'This module has live id.' });

    try {
      const startMeeting = await this.zoomService.createMeeting(meeting);
      // const moduleData = { live_link: startMeeting.id.toString() };
      const moduleData = { 
        live_link: startMeeting.start_url.toString(), 
        live_id: startMeeting.id.toString() 
      };
      await this.meetingsService.updateModule(meeting.module_id, moduleData);
      return res.status(HttpStatus.OK).json(startMeeting);
    } catch (error) {
      console.error('Error creating meeting:', error.response?.data || error.message);
      throw new Error('Failed to create meeting');
    }
  }

  @Delete('/:moduleId')
  async deleteMeeting(@Param('moduleId') moduleId: number, @Res() res: Response) {
    // if module has live id
    const module = await this.meetingsService.getModule(moduleId);

    if (!!!module.live_id && !!!module.live_id)return res.status(HttpStatus.BAD_REQUEST).json({ message: 'This module dont have live id.' });

    try {
      await this.zoomService.deleteMeeting(module.live_id);
      const moduleData = { live_link: null, live_id: null };
      await this.meetingsService.updateModule(moduleId, moduleData);
      return res.status(HttpStatus.OK).json({ message: 'Meeting deletion success.' });
    } catch (error) {
      console.error('Error deleting meeting:', error.response?.data || error.message);
      throw new Error('Failed to delete meeting');
    }
  }
}
