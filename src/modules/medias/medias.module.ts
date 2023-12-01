import { Module } from '@nestjs/common';
import { MediasController } from './medias.controller';
import { MediasService } from './services/medias.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { MediaRepository } from './repositories/media.repository';

@Module({
  imports: [PrismaModule],
  controllers: [MediasController],
  providers: [MediasService, MediaRepository]
})
export class MediasModule {}
