import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TreeDecorations } from './interfaces/decorations.interface';

@Injectable()
export class TreesService {
  constructor(private prisma: PrismaService) { }

  async getTree(userId: string) {
    const tree = await this.prisma.userTree.findUnique({
      where: { userId },
    });

    if (!tree) {
      // If tree doesn't exist, return default empty tree structure or throw error?
      // Better to return a default structure if user exists.
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return {
        userId,
        decorations: {},
        isLocked: false,
      };
    }

    return tree;
  }

  async updateTreeDecorations(userId: string, decorations: TreeDecorations) {
    return this.prisma.userTree.upsert({
      where: { userId },
      update: {
        decorations: decorations as any, // Prisma expects Json, so we cast to any or InputJsonValue
      },
      create: {
        userId,
        decorations: decorations as any,
        isLocked: false,
      },
    });
  }
}
