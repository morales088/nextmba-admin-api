import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterUserDTO {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsNotEmpty()
  @MinLength(8, {
    message: 'Password must be at least 8 characters long.',
  })
  password: string;
  
  @IsNotEmpty()
  role: number;
}

export class ValidateUserDTO {
  sub: string;
  name: string;
  email: string;
  role: number;
}