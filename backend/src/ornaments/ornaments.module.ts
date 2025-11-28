import { Module } from '@nestjs/common';
import { OrnamentsController } from './ornaments.controller';
import { OrnamentsService } from './ornaments.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OrnamentsController],
  providers: [OrnamentsService],
  exports: [OrnamentsService],
})
export class OrnamentsModule { }
