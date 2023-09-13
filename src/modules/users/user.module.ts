import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { HashService } from 'src/common/utils/hash.service';
import { jwtConstants } from 'src/common/constants/constant';
import { AuthService } from '../auth/services/auth.service';
import { JwtStrategy } from 'src/common/strategy/jwt.strategy';
import { LocalStrategy } from 'src/common/strategy/local.strategy';
import { UserService } from './services/user.service';
import { JwtModule } from '@nestjs/jwt';
import { UserRepository } from './repositories/user.repository';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { ImageService } from '../images/services/image.service';
import { ImageModule } from '../images/image.module';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: {
        expiresIn: '60d',
      },
    }),
    CloudinaryModule,
    PrismaModule,
    ImageModule,
  ],
  controllers: [UserController],
  providers: [UserService, HashService, AuthService, JwtStrategy, LocalStrategy, UserRepository],
})
export class UserModule {}
