import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDecorationsDto {
  @ApiProperty({ description: '트리 장식 데이터 (JSON)' })
  @IsObject()
  decorations: any;
}
