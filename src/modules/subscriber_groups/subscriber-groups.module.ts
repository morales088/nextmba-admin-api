import { Module } from '@nestjs/common';
import { SubscriberGroupsService } from './services/subscriber-groups.service';
import { SubscriberGroupsRepository } from './repositories/subscriber-groups.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Module({
  providers: [SubscriberGroupsService, SubscriberGroupsRepository, PrismaService],
  exports: [SubscriberGroupsService, SubscriberGroupsRepository]
})
export class SubscriberGroupsModule {}
