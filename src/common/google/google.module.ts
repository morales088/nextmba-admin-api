import { Global, Module } from '@nestjs/common';
import { GoogleCalendarService } from './services/google-calendar.service';
import { GoogleCalendarController } from './google-calendar.controller';

@Global()
@Module({
  providers: [GoogleCalendarService],
  exports: [GoogleCalendarService],
  controllers: [GoogleCalendarController],
})
export class GoogleModule {}
