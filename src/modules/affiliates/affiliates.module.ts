import { Module } from '@nestjs/common';
import { AffiliatesController } from './affiliates.controller';
import { AffiliatesService } from './services/affiliates.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { AffiliateRepository } from './repositories/affiliate.repository';
import { AffiliateWithdrawRepository } from './repositories/affiliate-withdraw.repository';

@Module({
  imports: [PrismaModule],
  controllers: [AffiliatesController],
  providers: [AffiliatesService, AffiliateRepository, AffiliateWithdrawRepository]
})
export class AffiliatesModule {}
