import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class ForgotPasswordDTO {
  @IsEmail()
  email: string;
}

export class ResetPasswordDTO {
  @IsNotEmpty()
  resetToken: string;

  @IsNotEmpty()
  @MinLength(8, {
    message: 'Password must be at least 8 characters long.',
  })
  newPassword: string;

  @IsNotEmpty()
  confirmPassword: string;
}
