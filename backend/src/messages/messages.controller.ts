import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
// Assuming JwtAuthGuard exists in auth module, if not I might need to check. 
// Based on file list, auth folder exists.
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  async sendMessage(@Request() req, @Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.sendMessage(req.user.id, createMessageDto);
  }
}
