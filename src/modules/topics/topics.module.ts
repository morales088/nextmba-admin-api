import { Module } from '@nestjs/common';
import { TopicsController } from './topics.controller';
import { TopicsService } from './services/topics.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { TopicsRepository } from './repositories/topics.repository';
import { AwsService } from 'src/common/aws/aws.service';
import { AwsS3Service } from 'src/common/aws/aws_s3.service';

@Module({
  imports: [PrismaModule],
  controllers: [TopicsController],
  providers: [TopicsService, TopicsRepository, AwsService, AwsS3Service]
})
export class TopicsModule {}
