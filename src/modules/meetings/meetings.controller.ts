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
      const startMeeting = await this.zoomService.getMeetings();
    } catch (error) {
      throw new Error(error);
    }
  }

  @Post('/start')
  async createMeeting(@Body() createMeetingDto: CreateMeetingDto) {

    const meeting = {
      ...createMeetingDto,
    };

    try {
      const startMeeting = await this.zoomService.createMeeting(meeting.title);
    } catch (error) {
      throw new Error(error);
    }
  }
}
