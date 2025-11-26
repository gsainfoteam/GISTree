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
}
