import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { ModulesController } from './modules.controller';
import { ModulesService } from './services/modules.service';
import { ModuleRepository } from './repositories/module.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ModulesController],
  providers: [ModulesService, ModuleRepository],
})
export class ModulesModule {}
