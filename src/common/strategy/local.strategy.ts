import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from 'src/modules/auth/services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(username: string, password: string) {
    const user = await this.authService.validateUser(username, password);
    
    if (!user) {
      throw new UnauthorizedException({
        message: 'You have entered a wrong email or password.',
      });
    }
    
    const DEACTIVATED_USER_STATUS: number = 0;
    if (user.status === DEACTIVATED_USER_STATUS) {
      throw new ForbiddenException({
        message: 'Your account has been deactivated.',
      });
    }

    return user;
  }
}
