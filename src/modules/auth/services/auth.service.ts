import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterUserDTO, ValidateUserDTO } from '../dto/auth.dto';
import { UserService } from 'src/modules/users/services/user.service';
import { HashService } from 'src/common/utils/hash.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findUserWithPassword(email);

    if (user && (await this.hashService.comparePassword(password, user.password))) {
      return user;
    }

    return null;
  }

  async login(user: ValidateUserDTO) {
    return {
      email: user.email,
      accessToken: this.jwtService.sign(user),
    };
  }

  async register(registerUserDto: RegisterUserDTO) {
    const existingUser = await this.userService.findByEmail(registerUserDto.email);

    if (existingUser) {
      throw new BadRequestException('User already exists.');
    }

    const hashedPassword = await this.hashService.hashPassword(registerUserDto.password);

    const userData = {
      name: registerUserDto.name,
      email: registerUserDto.email,
      password: hashedPassword,
    };

    return this.userService.createUser(userData);
  }
}
