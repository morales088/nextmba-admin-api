import { Module } from '@nestjs/common';
import { AppliedStudiesService } from './services/applied_studies.service';
import { AppliedStudiesController } from './applied_studies.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { AppliedStudiesRepository } from './repositories/applied-studies.repository';
import { AwsS3Service } from 'src/common/aws/aws_s3.service';
import { AwsService } from 'src/common/aws/aws.service';

@Module({
  imports: [PrismaModule],
  providers: [AppliedStudiesService, AppliedStudiesRepository, AwsService, AwsS3Service],
  controllers: [AppliedStudiesController]
})
export class AppliedStudiesModule {}
