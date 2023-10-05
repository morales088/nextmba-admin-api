import { Module } from '@nestjs/common';
import { SpeakersController } from './speakers.controller';
import { SpeakersService } from './services/speakers.service';
import { SpeakerRepository } from './repositories/speaker.repository';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SpeakersController],
  providers: [SpeakersService, SpeakerRepository]
})
export class SpeakersModule {}
