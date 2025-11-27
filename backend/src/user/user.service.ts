import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserInfo } from '@libs/infoteam-idp';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }

  async findOrCreate(userInfo: UserInfo) {
    // GIST 이메일 검증 (@gist.ac.kr 또는 @gm.gist.ac.kr)
    const isGistEmail = userInfo.email?.endsWith('@gist.ac.kr') || userInfo.email?.endsWith('@gm.gist.ac.kr');

    if (!isGistEmail) {
      throw new UnauthorizedException('GIST 학생만 이용 가능합니다');
    }

    // 학번 검증
    if (!userInfo.studentId) {
      throw new UnauthorizedException('학번 정보가 필요합니다');
    }

    // DB에서 사용자 찾거나 생성 (학번으로 검색)
    let user = await this.prisma.user.findUnique({
      where: { studentId: userInfo.studentId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          id: userInfo.uuid,
          name: userInfo.name,
          email: userInfo.email,
          studentId: userInfo.studentId,
        },
      });
    }

    return user;
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async searchUsers(query: string) {
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { studentId: { contains: query } },
        ],
      },
      select: {
        id: true,
        name: true,
        studentId: true,
      },
      take: 10,
    });

    // Extract admission year from studentId (e.g., 20241423 -> 24)
    return users.map(user => ({
      ...user,
      admissionYear: this.extractAdmissionYear(user.studentId),
    }));
  }

  private extractAdmissionYear(studentId: string): string {
    // Assuming studentId format is YYYYXXXX where YYYY is the year
    // Extract last 2 digits of year (e.g., 2024 -> 24)
    if (studentId && studentId.length >= 4) {
      const year = studentId.substring(0, 4);
      return year.substring(2, 4);
    }
    return '';
  }
  async updateMailboxSettings(userId: string, isProtected: boolean, password?: string) {
    return this.prisma.mailboxSettings.upsert({
      where: { userId },
      update: {
        isProtected,
        password,
      },
      create: {
        userId,
        isProtected,
        password,
      },
    });
  }

  async updateTreeSettings(userId: string, isLocked: boolean, password?: string) {
    // Tree might need initial decorations if created for the first time
    // But here we just update settings.
    // If tree doesn't exist, we create it with empty decorations.
    return this.prisma.userTree.upsert({
      where: { userId },
      update: {
        isLocked,
        password,
      },
      create: {
        userId,
        isLocked,
        password,
        decorations: {}, // Empty decorations
      },
    });
  }
}
