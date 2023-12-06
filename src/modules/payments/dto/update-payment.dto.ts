import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsDateString, IsDecimal, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePaymentDto {
    @IsOptional()
    @IsString()
    remarks: string;
}
