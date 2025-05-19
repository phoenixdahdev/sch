import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsBooleanString,
} from 'class-validator';

export class JoinWaitlistDto {
  @ApiPropertyOptional({
    description: 'Full name of the user',
    example: 'Jane Doe',
  })
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'jane.doe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiPropertyOptional({
    description: 'Optional referral source (e.g., Twitter, LinkedIn, friend)',
    example: 'Twitter',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  referralSource?: string;
}

export class InviteWaitlistUserDto {
  @ApiProperty({
    description: 'Email of the user to invite from the waitlist',
    example: 'jane.doe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;
}

export class GetWaitlistFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by invitation status (true or false)',
    example: 'true',
  })
  @IsOptional()
  @IsBooleanString()
  isInvited?: string;
}
