import { Prisma } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsDateString, IsDecimal, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateGiftDto {
    @IsNotEmpty()
    @Transform(({ value }) => parseInt(value))
    quantity: number;
}
