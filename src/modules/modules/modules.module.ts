import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { ModulesController } from './modules.controller';
import { ModulesService } from './services/modules.service';
import { ModuleRepository } from './repositories/module.repository';
import { AwsS3Service } from 'src/common/aws/aws_s3.service';
import { AwsService } from 'src/common/aws/aws.service';

@Module({
  imports: [PrismaModule],
  controllers: [ModulesController],
  providers: [ModulesService, ModuleRepository, AwsService, AwsS3Service],
  exports: [ModulesService, ModuleRepository, AwsService, AwsS3Service],
})
export class ModulesModule {}
