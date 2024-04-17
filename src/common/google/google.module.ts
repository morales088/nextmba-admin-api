import { Module } from '@nestjs/common';
import { GoogleCalendarService } from './services/google-calendar.service';
import { GoogleCalendarController } from './google-calendar.controller';

@Module({
  providers: [GoogleCalendarService],
  exports: [GoogleCalendarService],
  controllers: [GoogleCalendarController],
})
export class GoogleModule {}
