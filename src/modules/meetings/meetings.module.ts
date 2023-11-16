import { Module } from '@nestjs/common';
import { MeetingsController } from './meetings.controller';
import { MeetingsService } from './services/meetings.service';
import { ZoomService } from 'src/common/utils/zoom.service';

@Module({
  controllers: [MeetingsController],
  providers: [MeetingsService, ZoomService]
})
export class MeetingsModule {}
