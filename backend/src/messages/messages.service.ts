import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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

  async getReceivedMessages(userId: string) {
    return this.prisma.message.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: { id: true, name: true, studentId: true },
        },
      },
    });
  }

  async getSentMessages(userId: string) {
    return this.prisma.message.findMany({
      where: { senderId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        receiver: {
          select: { id: true, name: true, studentId: true },
        },
      },
    });
  }

  async getMessage(userId: string, messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: { select: { id: true, name: true, studentId: true } },
        receiver: { select: { id: true, name: true, studentId: true } },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check permission
    if (message.senderId !== userId && message.receiverId !== userId) {
      throw new NotFoundException('Message not found'); // Hide existence
    }

    return message;
  }

  async deleteMessage(userId: string, messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Only sender or receiver can delete (or maybe just receiver? let's allow both for now)
    if (message.senderId !== userId && message.receiverId !== userId) {
      throw new UnauthorizedException('You do not have permission to delete this message');
    }

    return this.prisma.message.delete({
      where: { id: messageId },
    });
  }
}
