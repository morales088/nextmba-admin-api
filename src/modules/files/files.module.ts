import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './sevices/files.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { FileRepository } from './repositories/file.repository';

@Module({
  imports: [PrismaModule],
  controllers: [FilesController],
  providers: [FilesService, FileRepository]
})
export class FilesModule {}
