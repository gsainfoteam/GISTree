import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrnamentsService {
  constructor(private prisma: PrismaService) { }

  async getAllOrnaments() {
    return this.prisma.ornament.findMany();
  }

  async getUserOrnaments(userId: string) {
    return this.prisma.userOrnament.findMany({
      where: { userId },
      include: {
        ornament: true,
      },
    });
  }
}
