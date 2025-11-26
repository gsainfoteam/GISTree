import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { InfoteamIdpService } from '@libs/infoteam-idp';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { Response, Request } from 'express';
import { BadRequestException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';

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
  });

  describe('callback', () => {
    it('should throw BadRequestException if code is missing', async () => {
      const req = mockRequest();
      const res = mockResponse();
      await expect(controller.callback(undefined as any, req, res)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if code_verifier cookie is missing', async () => {
      const req = mockRequest({});
      const res = mockResponse();
      await expect(controller.callback('some-code', req, res)).rejects.toThrow(BadRequestException);
    });

    it('should exchange code for token, validate user, and return JWT on success', async () => {
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

      const result = await controller.callback(code, req, res);

      expect(res.clearCookie).toHaveBeenCalledWith('code_verifier');
      expect(httpService.post).toHaveBeenCalled();
      expect(idpService.validateAccessToken).toHaveBeenCalledWith(accessToken);
      expect(authService.validateUser).toHaveBeenCalledWith(userInfo);
      expect(authService.login).toHaveBeenCalledWith(user);
      expect(result).toEqual({
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          studentId: user.studentId,
        },
        access_token: jwt.access_token,
      });
    });

    it('should throw UnauthorizedException if authService.validateUser throws UnauthorizedException', async () => {
      const req = mockRequest({ code_verifier: 'test-verifier' });
      const res = mockResponse();
      const code = 'test-code';

      jest.spyOn(httpService, 'post').mockReturnValue(of({ data: { access_token: 'token' } } as any));
      jest.spyOn(idpService, 'validateAccessToken').mockResolvedValue({} as any);
      jest.spyOn(authService, 'validateUser').mockRejectedValue(new UnauthorizedException('Not a student'));

      await expect(controller.callback(code, req, res)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw InternalServerErrorException on unexpected errors', async () => {
      const req = mockRequest({ code_verifier: 'test-verifier' });
      const res = mockResponse();
      const code = 'test-code';

      jest.spyOn(httpService, 'post').mockReturnValue(throwError(() => new Error('Network error')));

      await expect(controller.callback(code, req, res)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
