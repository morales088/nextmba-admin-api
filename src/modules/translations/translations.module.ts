import { Module } from '@nestjs/common';
import { TranslationsController } from './translations.controller';
import { TranslationsService } from './services/translations.service';
import { TranslationRepository } from './repositories/translation.repository';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TranslationsController],
  providers: [TranslationsService, TranslationRepository]
})
export class TranslationsModule {}
