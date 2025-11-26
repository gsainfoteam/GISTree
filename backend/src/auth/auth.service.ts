import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UserInfo } from '@libs/infoteam-idp';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) { }

  async validateUser(userInfo: UserInfo) {
    return this.userService.findOrCreate(userInfo);
  }

  async login(user: any) {
    const payload = { username: user.name, sub: user.uuid, studentId: user.studentId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
