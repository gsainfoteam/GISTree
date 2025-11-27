import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { InfoteamIdpService } from '@libs/infoteam-idp';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { Response, Request } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let idpService: InfoteamIdpService;
  let httpService: HttpService;
  let configService: ConfigService;

  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    res.redirect = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.status = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  const mockRequest = (cookies = {}) => {
    return {
      cookies,
    } as unknown as Request;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
          },
        },
        {
          provide: InfoteamIdpService,
          useValue: {
            validateAccessToken: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              if (key === 'IDP_CLIENT_ID') return 'test-client-id';
              if (key === 'IDP_CLIENT_SECRET') return 'test-client-secret';
              if (key === 'BACKEND_URL') return 'http://backend.test';
              if (key === 'FRONTEND_URL') return 'http://frontend.test';
              return 'test-value';
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    idpService = module.get<InfoteamIdpService>(InfoteamIdpService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should generate code_verifier, set cookie, and redirect to IDP', async () => {
      const res = mockResponse();
      await controller.login(res);

      expect(res.cookie).toHaveBeenCalledWith(
        'code_verifier',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          maxAge: 600000,
        }),
      );
      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('https://idp.gistory.me/authorize'));
      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('client_id=test-client-id'));
    });

    it('should include state when redirect_url is provided', async () => {
      const res = mockResponse();

      await controller.login(res, '/write?tab=inbox');

      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('state=%252Fwrite%253Ftab%253Dinbox'));
    });
  });

  describe('callback', () => {
    it('should redirect to auth failed if code is missing', async () => {
      const req = mockRequest();
      const res = mockResponse();
      await controller.callback(undefined as any, undefined, req, res);

      expect(res.redirect).toHaveBeenCalledWith('http://frontend.test/auth/failed?reason=missing_code');
    });

    it('should redirect to auth failed if code_verifier cookie is missing', async () => {
      const req = mockRequest({});
      const res = mockResponse();
      await controller.callback('some-code', undefined, req, res);

      expect(res.redirect).toHaveBeenCalledWith('http://frontend.test/auth/failed?reason=session_expired');
    });

    it('should exchange code for token, validate user, and redirect to frontend callback', async () => {
      const req = mockRequest({ code_verifier: 'test-verifier' });
      const res = mockResponse();
      const code = 'test-code';
      const accessToken = 'test-access-token';
      const userInfo = { uuid: 'u1', name: 'Test', email: 'test@gist.ac.kr', studentId: '2024' };
      const user = { id: 'u1', name: 'Test', email: 'test@gist.ac.kr', studentId: '2024' };
      const jwt = { access_token: 'jwt-token' };

      jest.spyOn(httpService, 'post').mockReturnValue(of({ data: { access_token: accessToken } } as any));
      jest.spyOn(idpService, 'validateAccessToken').mockResolvedValue(userInfo as any);
      jest.spyOn(authService, 'validateUser').mockResolvedValue(user as any);
      jest.spyOn(authService, 'login').mockResolvedValue(jwt);

      await controller.callback(code, '%2Fwrite', req, res);

      expect(res.clearCookie).toHaveBeenCalledWith('code_verifier');
      expect(httpService.post).toHaveBeenCalled();
      expect(idpService.validateAccessToken).toHaveBeenCalledWith(accessToken);
      expect(authService.validateUser).toHaveBeenCalledWith(userInfo);
      expect(authService.login).toHaveBeenCalledWith(user);
      expect(res.redirect).toHaveBeenCalledWith(
        'http://frontend.test/auth/callback?redirect_url=%2Fwrite',
      );
    });

    it('should redirect to auth failed on unexpected errors', async () => {
      const req = mockRequest({ code_verifier: 'test-verifier' });
      const res = mockResponse();
      const code = 'test-code';

      jest.spyOn(httpService, 'post').mockReturnValue(throwError(() => new Error('Network error')));

      await controller.callback(code, undefined, req, res);

      expect(res.redirect).toHaveBeenCalledWith('http://frontend.test/auth/failed?reason=login_failed');
    });
  });
});
