import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { OrnamentsService } from '../ornaments/ornaments.service';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private ornamentsService: OrnamentsService,
  ) { }

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
        replyTo: dto.replyToId ? { connect: { id: dto.replyToId } } : undefined,
      },
    });

    // Create notification for receiver
    await this.notificationsService.createNotification(
      receiver.id,
      'MESSAGE_RECEIVED',
      'New Message Received',
      `You have received a new message from ${isAnonymous ? 'Anonymous' : 'a friend'}!`,
      '/inbox'
    );

    // Award random ornament to sender
    const allOrnaments = await this.ornamentsService.getAllOrnaments();
    if (allOrnaments.length > 0) {
      const randomOrnament = allOrnaments[Math.floor(Math.random() * allOrnaments.length)];

      // Check if user already has this ornament (optional, but let's allow duplicates or just count them? Schema has UserOrnament)
      // For now, just add it.
      await this.prisma.userOrnament.create({
        data: {
          userId: senderId,
          ornamentId: randomOrnament.id,
        },
      });

      // Notify sender about earned ornament
      await this.notificationsService.createNotification(
        senderId,
        'ORNAMENT_EARNED',
        'Ornament Earned!',
        `You earned a new ornament: ${randomOrnament.name}!`,
        '/'
      );
    }

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
