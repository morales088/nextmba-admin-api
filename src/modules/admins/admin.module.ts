import { Module } from '@nestjs/common';
import { AdminService } from './services/admin.service';
import { AdminController } from './admin.controller';
import { AdminRepository } from './repositories/admin.repository';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { HashService } from 'src/common/utils/hash.service';

@Module({
  imports: [PrismaModule],
  providers: [AdminService, AdminRepository, HashService],
  controllers: [AdminController]
})
export class AdminModule {}
