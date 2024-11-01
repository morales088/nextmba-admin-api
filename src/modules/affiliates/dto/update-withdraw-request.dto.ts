import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { WithdrawStatus } from '../../../common/constants/enum';

export class UpdateWithdrawRequestDto {
  @IsOptional()
  @IsString()
  withdrawal_info: string;

  @IsOptional()
  @IsString()
  remarks: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsEnum(WithdrawStatus)
  status: number;
}
