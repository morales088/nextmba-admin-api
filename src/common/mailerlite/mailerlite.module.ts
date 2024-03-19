import { Global, Module } from '@nestjs/common';
import { MailerLiteService } from './mailerlite.service';
import { MailerliteMappingService } from './mailerlite-mapping.service';

@Global()
@Module({
  providers: [MailerLiteService, MailerliteMappingService],
  exports: [MailerLiteService, MailerliteMappingService]
})
export class MailerliteModule {}
