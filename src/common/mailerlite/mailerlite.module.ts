import { Global, Module } from '@nestjs/common';
import { MailerLiteService } from './mailerlite.service';
import { SubscriberGroupsModule } from 'src/modules/subscriber_groups/subscriber-groups.module';

@Global()
@Module({
  imports: [SubscriberGroupsModule],
  providers: [MailerLiteService],
  exports: [MailerLiteService]
})
export class MailerliteModule {}
