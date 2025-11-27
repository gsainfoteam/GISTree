import { Controller, Get, Post, Query, Res, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { InfoteamIdpService } from '@libs/infoteam-idp';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as express from 'express';
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
  @ApiQuery({
    name: 'redirect_url',
    description: '로그인 후 리다이렉트할 프론트엔드 URL (옵션)',
    required: false
  })
  @ApiResponse({ status: 302, description: 'IDP 로그인 페이지로 리다이렉트' })
  async login(@Res() res: express.Response, @Query('redirect_url') redirectUrl?: string) {
    console.log('Login initiated with redirect_url:', redirectUrl);
    const clientId = this.configService.getOrThrow<string>('IDP_CLIENT_ID');
    const backendUrl = this.configService.getOrThrow<string>('BACKEND_URL');
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const redirectUri = this.configService.get<string>('IDP_CALLBACK_URL') || `${backendUrl}/auth/callback`;

    // 1. Generate PKCE code_verifier and code_challenge
    // For 'plain' method, code_challenge is the same as code_verifier
    const codeVerifier = crypto.randomBytes(32).toString('hex');
    const codeChallenge = codeVerifier;
    const nonce = crypto.randomBytes(16).toString('hex');

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
    authUrl.searchParams.set('scope', 'openid profile student_id email');
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'plain');
    authUrl.searchParams.set('nonce', nonce);
    authUrl.searchParams.set('prompt', 'consent');

    const safeRedirectPath = this.getSafeRedirectPath(redirectUrl, frontendUrl);
    const statePath = safeRedirectPath || '/';
    const state = Buffer.from(statePath).toString('base64');
    authUrl.searchParams.set('state', state);

    console.log('--- IDP Login Debug ---');
    console.log('Client ID:', clientId);
    console.log('Redirect URI:', redirectUri);
    console.log('Generated Auth URL:', authUrl.toString());
    console.log('-----------------------');

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
  @ApiQuery({
    name: 'state',
    description: 'OAuth2 state 파라미터 (리다이렉트 URL 포함)',
    required: false
  })
  @ApiResponse({
    status: 302,
    description: '프론트엔드로 리다이렉트 (성공 시 토큰 포함)'
  })
  async callback(
    @Query('code') code: string,
    @Query('state') state: string | undefined,
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const backendUrl = this.configService.getOrThrow<string>('BACKEND_URL');

    console.log('Callback received:', { code, state });

    if (!code) {
      return res.redirect(`${frontendUrl}/auth/failed?reason=missing_code`);
    }

    const codeVerifier = req.cookies['code_verifier'];
    if (!codeVerifier) {
      console.error('No code_verifier cookie found');
      return res.redirect(`${frontendUrl}/auth/failed?reason=session_expired`);
    }

    // Clear the cookie
    res.clearCookie('code_verifier');

    try {
      const clientId = this.configService.getOrThrow<string>('IDP_CLIENT_ID');
      const clientSecret = this.configService.getOrThrow<string>('IDP_CLIENT_SECRET');
      const redirectUri = this.configService.get<string>('IDP_CALLBACK_URL') || `${backendUrl}/auth/callback`;

      // 1. Exchange Authorization Code for Access Token
      const tokenParams = new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        code_verifier: codeVerifier,
        redirect_uri: redirectUri,
      });

      console.log('Exchanging code for token...');
      const tokenResponse = await firstValueFrom(
        this.httpService.post<{ access_token: string }>(
          'https://api.idp.gistory.me/oauth2/token',
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

      let decodedState = '/';
      if (state) {
        try {
          decodedState = Buffer.from(state, 'base64').toString('utf-8');
        } catch (e) {
          console.error('Failed to decode state:', e);
        }
      }

      const redirectPath = this.getSafeRedirectPath(decodedState, frontendUrl) ?? '/';
      const frontendRedirect = `${frontendUrl}/auth/callback?redirect_url=${encodeURIComponent(redirectPath)}&access_token=${jwt.access_token}`;

      return res.redirect(frontendRedirect);

    } catch (error) {
      console.error('Login failed:', error);
      return res.redirect(`${frontendUrl}/auth/failed?reason=login_failed`);
    }
  }

  @Post('logout')
  @ApiOperation({ summary: '로그아웃', description: 'HttpOnly 쿠키를 삭제하여 로그아웃합니다.' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  async logout(@Res() res: express.Response) {
    res.clearCookie('access_token');
    res.clearCookie('csrf_token');
    return res.status(200).json({ message: 'Logged out successfully' });
  }

  private getSafeRedirectPath(rawRedirect: string | undefined, frontendUrl: string): string | undefined {
    if (!rawRedirect) return undefined;

    try {
      const decoded = decodeURIComponent(rawRedirect);

      if (decoded.startsWith('/')) {
        return decoded;
      }

      const frontendOrigin = new URL(frontendUrl);
      const target = new URL(decoded, frontendOrigin);

      if (target.origin === frontendOrigin.origin) {
        return target.pathname + target.search + target.hash;
      }
    } catch (error) {
      console.warn('Invalid redirect url provided', error);
    }

    return undefined;
  }
}
