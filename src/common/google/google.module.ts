import { Global, Module } from '@nestjs/common';
import { GoogleCalendarService } from './services/google-calendar.service';
import { GoogleCalendarController } from './google-calendar.controller';
import { GenerateEventService } from './services/generate-event-service';
import { ModulesModule } from 'src/modules/modules/modules.module';

@Global()
@Module({
  imports: [ModulesModule],
  controllers: [GoogleCalendarController],
  providers: [GoogleCalendarService, GenerateEventService],
  exports: [GoogleCalendarService, GenerateEventService],
})
export class GoogleModule {}
