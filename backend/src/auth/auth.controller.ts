import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { InfoteamIdpService } from '@libs/infoteam-idp';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import type { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly idpService: InfoteamIdpService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) { }

  @Get('callback')
  @ApiOperation({
    summary: 'GIST IDP OAuth2 콜백',
    description: 'GIST IDP 로그인 후 리다이렉트되는 엔드포인트입니다. Authorization code를 받아 Access Token으로 교환하고 사용자 정보를 조회합니다.'
  })
  @ApiQuery({
    name: 'code',
    description: 'GIST IDP에서 발급한 Authorization Code',
    required: true
  })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Login successful' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-here' },
            name: { type: 'string', example: '홍길동' },
            email: { type: 'string', example: 's20241234@gist.ac.kr' },
            studentId: { type: 'string', example: '20241234' }
          }
        },
        access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Authorization code가 없음'
  })
  @ApiResponse({
    status: 401,
    description: 'GIST 학생이 아니거나 인증 실패'
  })
  @ApiResponse({
    status: 500,
    description: '로그인 처리 중 서버 오류'
  })
  async callback(@Query('code') code: string, @Res() res: Response) {
    if (!code) {
      return res.status(400).send('Authorization code is missing');
    }

    try {
      const clientId = this.configService.getOrThrow<string>('IDP_CLIENT_ID');
      const clientSecret = this.configService.getOrThrow<string>('IDP_CLIENT_SECRET');
      const redirectUri = 'http://localhost:3000/auth/callback'; // Make sure this matches IDP registration

      // 1. Exchange Authorization Code for Access Token
      const tokenResponse = await firstValueFrom(
        this.httpService.post<{ access_token: string }>(
          'https://api.idp.gistory.me/oauth/token',
          {
            code: code,
            grant_type: 'authorization_code',
            code_verifier: 'any_string', // The user guide says "code_challenge: 아무 string", "code_verifier: code_challenge 값 그대로"
            redirect_uri: redirectUri,
          },
          {
            headers: {
              'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        )
      );

      const { access_token } = tokenResponse.data;

      // 2. Validate Access Token and get User Info
      const userInfo = await this.idpService.validateAccessToken(access_token);

      // 3. Find or Create User
      const user = await this.authService.validateUser(userInfo);

      // 4. Generate JWT
      const jwt = await this.authService.login(user);

      // 5. Return JWT or Redirect to Frontend with JWT
      // For now, just return JSON. In real app, redirect to frontend with token in query or cookie.
      return res.json({
        message: 'Login successful',
        user,
        access_token: jwt.access_token,
      });

    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      return res.status(500).json({ message: 'Login failed', error: error.message });
    }
  }
}
