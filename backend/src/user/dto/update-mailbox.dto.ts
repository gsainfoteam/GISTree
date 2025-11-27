import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMailboxDto {
  @ApiProperty({ description: '우편함 보호 여부' })
  @IsBoolean()
  isProtected: boolean;

  @ApiProperty({ description: '우편함 비밀번호 (보호 시 필수)', required: false })
  @IsString()
  @IsOptional()
  password?: string;
}
