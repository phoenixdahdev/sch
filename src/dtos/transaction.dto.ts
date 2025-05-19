import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the user making the transaction',
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 1000, description: 'Amount of the transaction' })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'deposit', description: 'Type of transaction' })
  @IsEnum(['deposit', 'withdraw', 'transfer'])
  type: 'deposit' | 'withdraw' | 'transfer';

  @ApiProperty({
    example: 'Top-up wallet',
    description: 'Description for the transaction',
    required: false,
  })
  @IsOptional()
  description?: string;
}
