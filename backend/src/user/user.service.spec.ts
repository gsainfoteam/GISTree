import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOrCreate', () => {
    it('should throw UnauthorizedException if email is not GIST email', async () => {
      const userInfo = { uuid: 'u1', name: 'Test', email: 'test@gmail.com', studentId: '2024' } as any;
      await expect(service.findOrCreate(userInfo)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if studentId is missing', async () => {
      const userInfo = { uuid: 'u1', name: 'Test', email: 'test@gist.ac.kr', studentId: undefined } as any;
      await expect(service.findOrCreate(userInfo)).rejects.toThrow(UnauthorizedException);
    });

    it('should return existing user if found', async () => {
      const userInfo = { uuid: 'u1', name: 'Test', email: 'test@gist.ac.kr', studentId: '2024' } as any;
      const existingUser = { id: 'u1', ...userInfo };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);

      const result = await service.findOrCreate(userInfo);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { studentId: '2024' } });
      expect(result).toEqual(existingUser);
    });

    it('should create and return new user if not found', async () => {
      const userInfo = { uuid: 'u1', name: 'Test', email: 'test@gist.ac.kr', studentId: '2024' } as any;
      const newUser = { id: 'u1', ...userInfo };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(newUser);

      const result = await service.findOrCreate(userInfo);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { studentId: '2024' } });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          id: userInfo.uuid,
          name: userInfo.name,
          email: userInfo.email,
          studentId: userInfo.studentId,
        },
      });
      expect(result).toEqual(newUser);
    });
  });
});
