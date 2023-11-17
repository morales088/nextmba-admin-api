import { Module } from '@nestjs/common';
import { MeetingsController } from './meetings.controller';
import { MeetingsService } from './services/meetings.service';
import { ZoomService } from 'src/common/utils/zoom.service';
import { ModuleRepository } from '../modules/repositories/module.repository';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MeetingsController],
  providers: [MeetingsService, ZoomService, ModuleRepository]
})
export class MeetingsModule {}
