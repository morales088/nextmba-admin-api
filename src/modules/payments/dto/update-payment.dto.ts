import { Prisma } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsDateString, IsDecimal, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePaymentDto {
    @IsOptional()
    @IsString()
    remarks: string;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsIn([0, 1, 2]) //[0 - Void, 1 - Paid, 2 - Refunded]
    status: number;
}
