import { IsBoolean, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTreeDto {
  @ApiProperty({ description: '트리 잠금 여부' })
  @IsBoolean()
  isLocked: boolean;

  @ApiProperty({ description: '트리 비밀번호 (잠금 시 필수)', required: false })
  @IsString()
  @ValidateIf((o) => o.isLocked === true)
  password?: string;
}
