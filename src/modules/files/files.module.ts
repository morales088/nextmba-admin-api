import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './sevices/files.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { FileRepository } from './repositories/file.repository';
import { AwsS3Service } from 'src/common/aws/aws_s3.service';
import { AwsService } from 'src/common/aws/aws.service';

@Module({
  imports: [PrismaModule],
  controllers: [FilesController],
  providers: [FilesService, FileRepository, AwsService, AwsS3Service]
})
export class FilesModule {}
