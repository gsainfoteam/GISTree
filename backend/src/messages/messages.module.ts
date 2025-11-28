import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrnamentsModule } from '../ornaments/ornaments.module';

@Module({
  imports: [PrismaModule, NotificationsModule, OrnamentsModule],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule { }
