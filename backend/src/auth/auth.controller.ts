import { Controller, Get, Query, Res, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { InfoteamIdpService } from '@libs/infoteam-idp';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import type { Response, Request } from 'express';
import * as crypto from 'crypto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly idpService: InfoteamIdpService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) { }

  @Get('login')
  @ApiOperation({
    summary: 'GIST IDP 로그인 시작',
    description: 'PKCE를 위한 code_verifier를 생성하고 쿠키에 저장한 후, IDP 로그인 페이지로 리다이렉트합니다.'
  })
  @ApiResponse({ status: 302, description: 'IDP 로그인 페이지로 리다이렉트' })
  async login(@Res() res: Response) {
    const clientId = this.configService.getOrThrow<string>('IDP_CLIENT_ID');
    const redirectUri = 'http://localhost:3000/auth/callback';

    // 1. Generate PKCE code_verifier and code_challenge
    // For 'plain' method, code_challenge is the same as code_verifier
    const codeVerifier = crypto.randomBytes(32).toString('hex');
    const codeChallenge = codeVerifier;

    // 2. Store code_verifier in httpOnly cookie
    res.cookie('code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60 * 1000, // 10 minutes
    });

    // 3. Redirect to IDP
    const authUrl = new URL('https://idp.gistory.me/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'profile student_id email');
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'plain');

    return res.redirect(authUrl.toString());
  }

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
  async callback(@Query('code') code: string, @Req() req: Request, @Res() res: Response) {
    if (!code) {
      return res.status(400).send('Authorization code is missing');
    }

    const codeVerifier = req.cookies['code_verifier'];
    if (!codeVerifier) {
      return res.status(400).json({ message: 'Login session expired or invalid. Please try again.' });
    }

    // Clear the cookie
    res.clearCookie('code_verifier');

    try {
      const clientId = this.configService.getOrThrow<string>('IDP_CLIENT_ID');
      const clientSecret = this.configService.getOrThrow<string>('IDP_CLIENT_SECRET');
      const redirectUri = 'http://localhost:3000/auth/callback';

      // 1. Exchange Authorization Code for Access Token
      const tokenParams = new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        code_verifier: codeVerifier,
        redirect_uri: redirectUri,
      });

      const tokenResponse = await firstValueFrom(
        this.httpService.post<{ access_token: string }>(
          'https://api.idp.gistory.me/oauth/token',
          tokenParams.toString(),
          {
            headers: {
              Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      const { access_token } = tokenResponse.data;

      // 2. Validate Access Token and get User Info
      const userInfo = await this.idpService.validateAccessToken(access_token);

      // 3. Find or Create User (throws UnauthorizedException if not GIST student)
      const user = await this.authService.validateUser(userInfo);

      // 4. Generate JWT
      const jwt = await this.authService.login(user);

      // 5. Return JWT
      return res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          studentId: user.studentId,
        },
        access_token: jwt.access_token,
      });
    } catch (error) {
      // Handle specific error types
      if (error.name === 'UnauthorizedException' || error.response?.status === 401) {
        return res.status(401).json({
          message: 'GIST 학생이 아니거나 인증에 실패했습니다',
          error: error.message
        });
      }

      return res.status(500).json({
        message: 'Login failed',
        error: error.message
      });
    }
  }
}
