import { Module } from '@nestjs/common';
import { SpeakersController } from './speakers.controller';
import { SpeakersService } from './services/speakers.service';
import { SpeakerRepository } from './repositories/speaker.repository';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { AwsService } from 'src/common/aws/aws.service';
import { AwsS3Service } from 'src/common/aws/aws_s3.service';
import { HashService } from 'src/common/utils/hash.service';

@Module({
  imports: [PrismaModule],
  controllers: [SpeakersController],
  providers: [SpeakersService, SpeakerRepository, AwsService, AwsS3Service, HashService]
})
export class SpeakersModule {}
