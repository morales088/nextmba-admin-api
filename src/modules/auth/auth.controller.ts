import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RegisterUserDTO } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @UseGuards(AuthGuard('local'))
  async login(@Request() req: any) {
    const user = req.user;

    return this.authService.login({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      affiliate_only: user.affiliate_only,
    });
  }

  @Post('/register')
  async register(@Body() registerUserDto: RegisterUserDTO) {
    return this.authService.register(registerUserDto);
  }
}
