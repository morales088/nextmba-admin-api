import { Module } from '@nestjs/common';
import { TopicsController } from './topics.controller';
import { TopicsService } from './services/topics.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { TopicsRepository } from './repositories/topics.repositories';

@Module({
  imports: [PrismaModule],
  controllers: [TopicsController],
  providers: [TopicsService, TopicsRepository]
})
export class TopicsModule {}
