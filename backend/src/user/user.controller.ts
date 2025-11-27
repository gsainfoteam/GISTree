import { Controller, Get, UseGuards, Query, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import type { User } from '@prisma/client';
import { UserService } from './user.service';
import { UpdateMailboxDto } from './dto/update-mailbox.dto';
import { UpdateTreeDto } from './dto/update-tree.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '내 정보 조회',
    description: 'JWT 토큰으로 인증된 사용자의 정보를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '사용자 정보 조회 성공',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
        studentId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 사용자'
  })
  getMe(@GetUser() user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      createdAt: user.createdAt,
    };
  }
  @Get('search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '사용자 검색',
    description: '이름 또는 학번으로 사용자를 검색합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '검색 결과',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          studentId: { type: 'string' },
          admissionYear: { type: 'string', description: '학번 (예: 24학번)', example: '24' }
        }
      }
    }
  })
  async search(@Query('query') query: string) {
    return this.userService.searchUsers(query);
  }

  @Patch('me/mailbox')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '우편함 설정 수정', description: '우편함 잠금 여부 및 비밀번호를 설정합니다.' })
  @ApiResponse({ status: 200, description: '설정 수정 성공' })
  async updateMailbox(@GetUser() user: User, @Body() dto: UpdateMailboxDto) {
    return this.userService.updateMailboxSettings(user.id, dto.isProtected, dto.password);
  }

  @Patch('me/tree')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '트리 설정 수정', description: '트리 잠금 여부 및 비밀번호를 설정합니다.' })
  @ApiResponse({ status: 200, description: '설정 수정 성공' })
  async updateTree(@GetUser() user: User, @Body() dto: UpdateTreeDto) {
    return this.userService.updateTreeSettings(user.id, dto.isLocked, dto.password);
  }
}
