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
    // 1. Validate that the user owns all ornaments being placed
    const ornamentIds = new Set<string>();
    for (const key in decorations) {
      if (decorations[key].ornamentId) {
        ornamentIds.add(decorations[key].ornamentId);
      }
    }

    if (ornamentIds.size > 0) {
      const userOrnaments = await this.prisma.userOrnament.findMany({
        where: {
          userId,
          ornamentId: { in: Array.from(ornamentIds) },
        },
        select: { ornamentId: true },
      });

      const ownedOrnamentIds = new Set(userOrnaments.map((uo) => uo.ornamentId));
      for (const id of ornamentIds) {
        if (!ownedOrnamentIds.has(id)) {
          // If user doesn't own the ornament, we could throw an error or just ignore it.
          // Throwing error is safer.
          throw new NotFoundException(`User does not own ornament with ID ${id}`);
        }
      }
    }

    // 2. Update the tree
    return this.prisma.userTree.upsert({
      where: { userId },
      update: {
        decorations: decorations as any,
      },
      create: {
        userId,
        decorations: decorations as any,
        isLocked: false,
      },
    });
  }
}
