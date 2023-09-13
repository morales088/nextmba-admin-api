import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
// import { MongooseModule } from '@nestjs/mongoose';
// import { User, UserSchema } from '../users/schemas/user.schema';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { LocalStrategy } from 'src/common/strategy/local.strategy';
import { jwtConstants } from 'src/common/constants/constant';
import { HashService } from 'src/common/utils/hash.service';
import { UserService } from '../users/services/user.service';
import { UserRepository } from '../users/repositories/user.repository';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: {
        expiresIn: '60d',
      },
    }),
    PrismaModule
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, LocalStrategy, HashService, UserRepository],
})
export class AuthModule {}
