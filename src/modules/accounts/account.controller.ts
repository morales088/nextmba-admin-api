import { Body, Controller, Post } from '@nestjs/common';
import { AccountService } from './services/account.service';
import { ForgotPasswordDTO, ResetPasswordDTO } from './dto/account.dto';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('/forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDTO) {
    await this.accountService.sendPasswordResetEmail(forgotPasswordDto);
    return { message: 'Password reset email sent successfully.' };
  }

  @Post('/reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDTO) {
    await this.accountService.resetPassword(resetPasswordDto);
    return { message: 'Password reset successfully.' };
  }
}
