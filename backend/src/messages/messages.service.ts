import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) { }

  async sendMessage(senderId: string, dto: CreateMessageDto) {
    const { receiverStudentId, receiverName, content, isAnonymous } = dto;

    // Find receiver
    const receiver = await this.prisma.user.findUnique({
      where: {
        studentId: receiverStudentId,
      },
    });

    if (!receiver || receiver.name !== receiverName) {
      throw new NotFoundException('Receiver not found or name does not match.');
    }

    // Create message
    const message = await this.prisma.message.create({
      data: {
        content,
        isAnonymous: isAnonymous || false,
        sender: {
          connect: { id: senderId },
        },
        receiver: {
          connect: { id: receiver.id },
        },
      },
    });

    return message;
  }
}
