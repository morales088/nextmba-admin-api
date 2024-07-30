import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Res, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MeetingsService } from './services/meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { ZoomService } from 'src/common/utils/zoom.service';
import { Response } from 'express';
import { DailycoService } from 'src/common/utils/dailyCO.service';
import { StreamService } from 'src/common/utils/getStream.service';
import { CreateGetStreamDto } from './dto/create-getStream.dto';

@Controller('meetings')
@UseGuards(AuthGuard('jwt'))
export class MeetingsController {
  constructor(
    private readonly meetingsService: MeetingsService,
    private readonly zoomService: ZoomService,
    private readonly dailycoService: DailycoService,
    private readonly streamService: StreamService
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
        live_id: startMeeting.id.toString(),
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

    if (!!!module.live_id && !!!module.live_id)
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'This module dont have live id.' });

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

  @Post('/daily/start')
  async createDailyMeeting(@Body() createMeetingDto: CreateMeetingDto, @Res() res: Response) {
    const meeting = {
      ...createMeetingDto,
      type: 2,
    };

    // if module has live id
    const module = await this.meetingsService.getModule(meeting.module_id);

    if (!!module.live_link) return res.status(HttpStatus.BAD_REQUEST).json({ message: 'This module has live id.' });

    const startMeeting = await this.dailycoService.createMeetingRoom(meeting.title);
    const moduleData = {
      live_link: startMeeting.url.toString(),
      // live_id: startMeeting.id.toString(),
      live_id: startMeeting.name.toString(),
    };

    await this.meetingsService.updateModule(meeting.module_id, moduleData);
    return res.status(HttpStatus.OK).json(startMeeting);
  }

  @Delete('daily/:moduleId')
  async deleteDailyMeeting(@Param('moduleId') moduleId: number, @Res() res: Response) {
    // if module has live id
    const module = await this.meetingsService.getModule(moduleId);

    if (!!!module.live_id && !!!module.live_id)
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'This module dont have live id.' });

    await this.dailycoService.deleteMeetingRoom(module.live_id);
    const moduleData = { live_link: null, live_id: null };
    await this.meetingsService.updateModule(moduleId, moduleData);
    return res.status(HttpStatus.OK).json({ message: 'Meeting deletion success.' });
  }
  
  // // getStream
  // @Post('/getStream/start')
  // async createLiveStream() {
  //   const livestream = await this.streamService.createCall("call1234","user1234")
    
  //   return livestream
  // }

  // getStream
  @Post('/getStream/start')
  async createLiveStream(@Request() req: any, @Body() createGetStreamDto: CreateGetStreamDto, @Res() res: Response) {
    const admin = req.user;
    const meeting = {
      ...createGetStreamDto,
    };
    
    // if module has live id
    const module = await this.meetingsService.getModule(meeting.module_id);

    if (!!module.live_link) return res.status(HttpStatus.BAD_REQUEST).json({ message: 'This module has live id.' });
    
    const livestream = await this.streamService.createCall(meeting.call_id, admin.email)

    const moduleData = {
      live_link: livestream.callId.toString(),
      live_id: livestream.callId.toString(),
    };

    await this.meetingsService.updateModule(meeting.module_id, moduleData);
    
    return res.status(HttpStatus.OK).json(livestream);
  }

  @Post('/getStream/end')
  async endCall(@Body() body: { module_id: number, call_id: string }) {
    const moduleData = {
      live_link: null,
    };

    await this.meetingsService.updateModule(body.module_id, moduleData);
    return this.streamService.endCall(body.call_id);
  }

  @Post('/getStream/create-user')
  async createUser(@Body() body: { userId: string }) {
    return this.streamService.createUser(body.userId);
  }
}
