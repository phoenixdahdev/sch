import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: '1234567890', description: 'Payer account number' })
  accountNumber: string;

  @ApiProperty({ example: 5000, description: 'Amount to be paid' })
  amount: number;
}
