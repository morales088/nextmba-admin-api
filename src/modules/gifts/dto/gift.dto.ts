import { Prisma } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsDateString, IsDecimal, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateGiftDto {
    @IsNotEmpty()
    @Transform(({ value }) => parseInt(value))
    course_id: number;

    @IsNotEmpty()
    @Transform(({ value }) => parseInt(value))
    payment_id: number;

    @IsNotEmpty()
    @Transform(({ value }) => parseInt(value))
    student_id: number;

    @IsNotEmpty()
    @IsString()
    recipient: string;
}
