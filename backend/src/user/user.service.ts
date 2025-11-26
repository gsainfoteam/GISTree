import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserInfo } from '@libs/infoteam-idp';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }

  async findOrCreate(userInfo: UserInfo) {
    // GIST 이메일 검증
    if (!userInfo.email?.endsWith('@gist.ac.kr')) {
      throw new UnauthorizedException('GIST 학생만 이용 가능합니다');
    }

    // 학번 검증
    if (!userInfo.studentId) {
      throw new UnauthorizedException('학번 정보가 필요합니다');
    }

    // DB에서 사용자 찾거나 생성
    let user = await this.prisma.user.findUnique({
      where: { studentId: userInfo.studentId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          // uuid: userInfo.uuid, // Prisma schema에서 uuid가 id로 사용되는지 확인 필요. 현재 schema는 id가 uuid()임.
          // userInfo.uuid를 저장할 필드가 마땅치 않으면 id로 쓰거나 별도 필드 추가 필요.
          // 현재 스키마: id String @id @default(uuid())
          // 외부 UUID를 ID로 쓸 것인가? -> 보통은 내부 ID를 따로 두는게 좋지만, 여기서는 편의상 매핑하거나 별도 필드가 나을듯.
          // 하지만 스키마를 보면 id가 default(uuid())이므로, create시 id를 지정하지 않으면 자동 생성됨.
          // userInfo.uuid를 저장하고 싶다면 스키마에 uuid 필드를 추가하거나 id에 매핑해야 함.
          // 일단 스키마에 uuid 필드가 없으므로, id에 userInfo.uuid를 넣는 것으로 가정하거나, 
          // 스키마를 다시 확인해보니 `id String @id @default(uuid())` 임.
          // userInfo.uuid를 id로 사용하도록 강제할 수 있음.
          id: userInfo.uuid,
          name: userInfo.name,
          email: userInfo.email,
          studentId: userInfo.studentId,
        },
      });
    }

    return user;
  }
}
