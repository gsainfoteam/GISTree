import { Controller, Get, Query, Res, Req, BadRequestException, UnauthorizedException, InternalServerErrorException, HttpException } from '@nestjs/common';
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
    const backendUrl = this.configService.getOrThrow<string>('BACKEND_URL');
    const redirectUri = `${backendUrl}/auth/callback`;

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
    status: 302,
    description: '프론트엔드로 리다이렉트 (성공 시 토큰 포함)'
  })
  async callback(@Query('code') code: string, @Req() req: Request, @Res() res: Response) {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const backendUrl = this.configService.getOrThrow<string>('BACKEND_URL');

    if (!code) {
      return res.redirect(`${frontendUrl}/auth/failed?reason=missing_code`);
    }

    const codeVerifier = req.cookies['code_verifier'];
    if (!codeVerifier) {
      return res.redirect(`${frontendUrl}/auth/failed?reason=session_expired`);
    }

    // Clear the cookie
    res.clearCookie('code_verifier');

    try {
      const clientId = this.configService.getOrThrow<string>('IDP_CLIENT_ID');
      const clientSecret = this.configService.getOrThrow<string>('IDP_CLIENT_SECRET');
      const redirectUri = `${backendUrl}/auth/callback`;

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

      // 5. Set HttpOnly Cookie and Redirect
      const csrfToken = crypto.randomBytes(32).toString('hex');

      res.cookie('csrf_token', csrfToken, {
        httpOnly: false, // Accessible to JavaScript
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.cookie('access_token', jwt.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // or 'strict' depending on requirements
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      return res.redirect(`${frontendUrl}/auth/callback`);

    } catch (error) {
      console.error('Login failed:', error);
      return res.redirect(`${frontendUrl}/auth/failed?reason=login_failed`);
    }
  }
  @Get('logout') // Or POST, but GET is easier for simple link, though POST is better for state change. Review suggested POST.
  @ApiOperation({ summary: '로그아웃', description: 'HttpOnly 쿠키를 삭제하여 로그아웃합니다.' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  async logout(@Res() res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('csrf_token');
    return res.status(200).json({ message: 'Logged out successfully' });
  }
}
