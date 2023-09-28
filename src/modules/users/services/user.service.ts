import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { HashService } from 'src/common/utils/hash.service';
import { ChangePasswordDTO } from '../dto/change-password.dto';
import { Users } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService
  ) {}

  async changePassword(email: string, changePasswordDto: ChangePasswordDTO) {
    const { oldPassword, newPassword, confirmPassword } = changePasswordDto;

    const user = await this.findUserWithPassword(email);
    const isOldPasswordValid = await this.hashService.comparePassword(oldPassword, user.password);

    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Invalid old password.');
    }

    if (newPassword === oldPassword) {
      throw new BadRequestException('New password must be different from the old password.');
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New password and confirmation password must match.');
    }

    const newHashedPassword = await this.hashService.hashPassword(newPassword);

    return this.updateUserPassword(user.id, newHashedPassword);
  }

  async updateUserPassword(id: number, password: string) {
    return this.userRepository.updatePassword(id, password);
  }

  async uploadUserProfile(userId: number, imageLink: string) {
    return this.userRepository.update(userId, { profileImage: imageLink });
  }

  async findUserWithPassword(email: string) {
    return this.userRepository.findUserWithPassword(email);
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async findById(id: number) {
    return this.userRepository.findById(id);
  }

  async findAllUsers() {
    return this.userRepository.findAll();
  }

  async createUser(data: Partial<Users>) {
    return this.userRepository.create(data);
  }

  async updateUser(id: number, data: Partial<Users>) {
    const updateData = {
      name: data.name,
      email: data.email,
    };
    return this.userRepository.update(id, updateData);
  }

  async deleteUser(id: number) {
    return this.userRepository.delete(id);
  }
}
