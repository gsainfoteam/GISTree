import { Module } from '@nestjs/common';
import { TreesController } from './trees.controller';
import { TreesService } from './trees.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TreesController],
  providers: [TreesService],
})
export class TreesModule { }
