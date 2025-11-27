import { IsBoolean, IsOptional, IsString, ValidateIf, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMailboxDto {
  @ApiProperty({ description: '우편함 보호 여부' })
  @IsBoolean()
  isProtected: boolean;

  @ApiProperty({ description: '우편함 비밀번호 (보호 시 필수)', required: false })
  @ValidateIf((o) => o.isProtected === true)
  @IsNotEmpty({ message: '우편함 보호 시 비밀번호는 필수입니다' })
  @IsString()
  password?: string;
}
