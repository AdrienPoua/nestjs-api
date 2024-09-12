import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUser = {
    id: '1',
    username: 'John Doe',
    password: 'Password',
  };
  const mockUserWithHashedPassword = {
    ...mockUser,
    password: 'HashedPassword',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        ConfigService,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(usersService).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(configService).toBeDefined();
  });

  /******************************************
   *        TEST: login()                   *
   ******************************************/
  describe('AuthService - login', () => {
    it('should return a JWT token when login is successful', async () => {
      const JWT_MOCKED_TOKEN = 'mocked_jwt_token';
      const expectedPayload = {
        username: mockUser.username,
        sub: mockUser.id,
      };
      /// SPYON ///
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue(JWT_MOCKED_TOKEN);

      /// ACTION ///
      const result = await authService.login(mockUser);

      /// EXPECT ///
      expect(result).toEqual({ access_token: JWT_MOCKED_TOKEN });
      expect(jwtService.sign).toHaveBeenCalledWith(expectedPayload);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
    });

    it('should throw an UnauthorizedException if password does not match', async () => {
      jest
        .spyOn(usersService, 'findOne')
        .mockResolvedValue(mockUserWithHashedPassword);
      // Mock de bcrypt.compare pour simuler un échec de la comparaison des mots de passe
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      await expect(authService.login(mockUser)).rejects.toThrow(
        UnauthorizedException,
      );

      // Vérification que jwtService.sign n'a pas été appelé
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  /******************************************
   *        TEST: register()                *
   ******************************************/
  describe('register', () => {
    it('should call UsersService.create to register a new user', async () => {
      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...userWithoutId } = mockUser;

      const result = await authService.createUserAccount(userWithoutId);
      expect(result).toEqual({ ...mockUser, password: expect.any(String) });
      expect(usersService.create).toHaveBeenCalledWith(userWithoutId);
    });
  });
});
