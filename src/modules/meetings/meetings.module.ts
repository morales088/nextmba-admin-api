import { Module } from '@nestjs/common';
import { MeetingsController } from './meetings.controller';
import { MeetingsService } from './services/meetings.service';
import { ZoomService } from 'src/common/utils/zoom.service';
import { ModuleRepository } from '../modules/repositories/module.repository';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { DailycoService } from '../../common/utils/dailyCO.service';
import { StreamService } from 'src/common/utils/getStream.service';

@Module({
  imports: [PrismaModule],
  controllers: [MeetingsController],
  providers: [MeetingsService, ZoomService, ModuleRepository, DailycoService, StreamService],
})
export class MeetingsModule {}
