import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrnamentsService } from './ornaments.service';

@ApiTags('ornaments')
@Controller('ornaments')
export class OrnamentsController {
  constructor(private readonly ornamentsService: OrnamentsService) { }

  @Get()
  @ApiOperation({ summary: '모든 오너먼트 조회', description: '시스템에 등록된 모든 오너먼트 목록을 조회합니다.' })
  @ApiResponse({ status: 200, description: '오너먼트 목록 조회 성공' })
  async getAllOrnaments() {
    return this.ornamentsService.getAllOrnaments();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 오너먼트 조회', description: '내가 보유한 오너먼트 목록을 조회합니다.' })
  @ApiResponse({ status: 200, description: '내 오너먼트 목록 조회 성공' })
  async getMyOrnaments(@Request() req) {
    return this.ornamentsService.getUserOrnaments(req.user.id);
  }
}
