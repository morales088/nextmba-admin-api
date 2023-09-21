import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { HashService } from 'src/common/utils/hash.service';
import { MailerService } from '@nestjs-modules/mailer';
import { UserService } from 'src/modules/users/services/user.service';
import { ResetPasswordTokenRepository } from '../repositories/reset-password-token.repository';
import { ForgotPasswordDTO, ResetPasswordDTO } from '../dto/account.dto';
import handlebars from 'handlebars';
import * as fs from 'fs';

@Injectable()
export class AccountService {
  constructor(
    private readonly hashService: HashService,
    private readonly mailerService: MailerService,
    private readonly passwordTokenRepository: ResetPasswordTokenRepository,
    private readonly userService: UserService
  ) {}

  async resetPassword(resetPasswordDto: ResetPasswordDTO) {
    const { resetToken, newPassword, confirmPassword } = resetPasswordDto;

    const tokenOwner = await this.passwordTokenRepository.findTokenOwner(resetToken);

    if (!tokenOwner) {
      throw new BadRequestException(`Token expired / not found.`);
    }

    const user = await this.userService.findById(tokenOwner.userId);

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New password and confirmation password must match.');
    }

    const newHashedPassword = await this.hashService.hashPassword(newPassword);

    await this.userService.updateUserPassword(user.id, newHashedPassword);

    await this.passwordTokenRepository.delete(tokenOwner.id);

    return user;
  }

  async sendPasswordResetEmail(forgotPasswordDto: ForgotPasswordDTO) {
    const user = await this.userService.findByEmail(forgotPasswordDto.email);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const existingRequest = await this.passwordTokenRepository.findById(user.id);
    const generatedToken = await this.hashService.generatePasswordToken();

    if (!existingRequest) {
      await this.createResetToken(user.id, generatedToken);
    } else {
      await this.updateResetToken(existingRequest, generatedToken);
    }

    const resetLink = process.env.RESET_ROUTE + '/' + generatedToken;
    await this.sendEmail(user.email, resetLink);
  }

  async createResetToken(userId: number, token: string) {
    await this.passwordTokenRepository.create({ userId, token });
  }

  async updateResetToken(existingRequest: any, newToken: string) {
    await this.passwordTokenRepository.update(existingRequest.id, {
      ...existingRequest,
      token: newToken,
    });
  }

  async sendEmail(email: string, resetLink: string) {
    const emailTemplate = fs.readFileSync('src/common/templates/password-reset.html', 'utf-8');
    const template = handlebars.compile(emailTemplate);
    const templateData = {
      resetUrl: resetLink,
    };
    const emailContent = template(templateData);
    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset',
      html: emailContent,
    });
  }
}
