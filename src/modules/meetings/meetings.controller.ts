import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MeetingsService } from './services/meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { ZoomService } from 'src/common/utils/zoom.service';

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
      return meetings
    } catch (error) {
      console.error('Error fetching meetings:', error.response?.data || error.message);
      throw new Error('Failed to fetch meetings');
    }
  }

  @Post('/start')
  async createMeeting(@Body() createMeetingDto: CreateMeetingDto) {

    const meeting = {
      ...createMeetingDto,
    };

    // if module has zoom id

    const module = await this.meetingsService.getModule(meeting.module_id)
    return module;


    // try {
    //   const startMeeting = await this.zoomService.createMeeting(meeting.title, 2);
    //   return startMeeting;
    // } catch (error) {
    //   console.error('Error creating meeting:', error.response?.data || error.message);
    //   throw new Error('Failed to create meeting');
    // }
  }
}
