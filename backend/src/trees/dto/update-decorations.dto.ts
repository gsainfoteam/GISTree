import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { TreeDecorations } from '../interfaces/decorations.interface';

export class UpdateDecorationsDto {
  @ApiProperty({ description: '트리 장식 데이터 (JSON)' })
  @IsObject()
  decorations: TreeDecorations;
}
