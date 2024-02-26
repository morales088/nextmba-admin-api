import { Module } from '@nestjs/common';
import { BillingsController } from './billings.controller';
import { BillingsService } from './services/billings.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { BillingRepository } from './repositories/billing.repository';

@Module({
  imports: [PrismaModule],
  controllers: [BillingsController],
  providers: [BillingsService, BillingRepository]
})
export class BillingsModule {}
