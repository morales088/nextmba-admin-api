import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator"

export class ForgotPasswordDTO {
    @IsNotEmpty()
    @IsString()
    old_password: string

    @IsNotEmpty()
    @IsString()
    @MinLength(8, {
      message: 'Password must be at least 8 characters long.',
    })
    new_password: string
}