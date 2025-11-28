import { Body, Controller, Post, Request, UseGuards, Get, Delete, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '쪽지 보내기',
    description: '다른 사용자에게 익명 또는 실명으로 쪽지를 보냅니다.'
  })
  @ApiResponse({
    status: 201,
    description: '쪽지 전송 성공',
  })
  @Post()
  async sendMessage(@Request() req, @Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.sendMessage(req.user.id, createMessageDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '받은 쪽지함', description: '내가 받은 쪽지 목록을 조회합니다.' })
  @ApiResponse({ status: 200, description: '받은 쪽지 목록 조회 성공' })
  async getReceivedMessages(@Request() req) {
    return this.messagesService.getReceivedMessages(req.user.id);
  }

  @Get('sent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '보낸 쪽지함', description: '내가 보낸 쪽지 목록을 조회합니다.' })
  @ApiResponse({ status: 200, description: '보낸 쪽지 목록 조회 성공' })
  async getSentMessages(@Request() req) {
    return this.messagesService.getSentMessages(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '쪽지 상세 조회', description: '쪽지의 상세 내용을 조회합니다.' })
  @ApiResponse({ status: 200, description: '쪽지 상세 조회 성공' })
  @ApiResponse({ status: 404, description: '쪽지를 찾을 수 없음' })
  async getMessage(@Request() req, @Param('id') id: string) {
    return this.messagesService.getMessage(req.user.id, id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '쪽지 삭제', description: '쪽지를 삭제합니다.' })
  @ApiResponse({ status: 200, description: '쪽지 삭제 성공' })
  @ApiResponse({ status: 404, description: '쪽지를 찾을 수 없음' })
  async deleteMessage(@Request() req, @Param('id') id: string) {
    return this.messagesService.deleteMessage(req.user.id, id);
  }
}
