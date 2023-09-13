import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './services/account.service';
import { HashService } from 'src/common/utils/hash.service';
import { UserService } from '../users/services/user.service';
import { UserRepository } from '../users/repositories/user.repository';
import { UserModule } from '../users/user.module';
import { ResetPasswordTokenRepository } from './repositories/reset-password-token.repository';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [UserModule, PrismaModule],
  controllers: [AccountController],
  providers: [AccountService, UserService, HashService, UserRepository, ResetPasswordTokenRepository],
})
export class AccountModule {}
