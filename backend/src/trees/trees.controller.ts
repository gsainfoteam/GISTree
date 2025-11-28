import { Controller, Get, Put, Body, UseGuards, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TreesService } from './trees.service';
import { UpdateDecorationsDto } from './dto/update-decorations.dto';

@ApiTags('trees')
@Controller('trees')
export class TreesController {
  constructor(private readonly treesService: TreesService) { }

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '트리 조회', description: '특정 사용자의 트리와 장식 정보를 조회합니다.' })
  @ApiResponse({ status: 200, description: '트리 조회 성공' })
  async getTree(@Param('userId') userId: string) {
    return this.treesService.getTree(userId);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 트리 꾸미기', description: '내 트리의 장식 정보를 업데이트합니다.' })
  @ApiResponse({ status: 200, description: '트리 업데이트 성공' })
  async updateMyTree(@Request() req, @Body() dto: UpdateDecorationsDto) {
    return this.treesService.updateTreeDecorations(req.user.id, dto.decorations);
  }
}
