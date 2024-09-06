import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    id: '1',
    username: 'John Doe',
    password: 'Password',
  };
  const mockUserNoPassword = { id: '1', username: 'John Doe' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
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
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  /******************************************
   *        TEST: validateUser()            *
   ******************************************/
  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      // Mock findOne pour retourner l'utilisateur
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

      // Mock bcrypt.compare pour simuler la vérification correcte du mot de passe
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true); // Simuler un mot de passe correct

      const result = await authService.validateUser('John Doe', 'password');
      expect(result).toEqual({
        id: mockUser.id,
        username: mockUser.username,
      });
    });

    it('should return null if credentials are invalid', async () => {
      // Mock findOne pour retourner l'utilisateur
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

      // Mock bcrypt.compare pour simuler la vérification incorrecte du mot de passe
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false); // Simuler un mot de passe incorrect

      const result = await authService.validateUser(
        'John Doe',
        'wrongPassword',
      );
      expect(result).toBeNull();
    });

    it('should return null if the password doesnt match', async () => {
      // Mock findOne pour retourner null
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
      const result = await authService.validateUser(
        'nonexistent',
        'fakePassword',
      );
      expect(result).toBeNull();
    });
  });

  /******************************************
   *        TEST: login()                   *
   ******************************************/
  describe('login', () => {
    it('should return a JWT token', async () => {
      // Mock le retour de la méthode sign de JwtService
      const mockToken = 'signed-jwt-token';
      jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken);

      const result = await authService.login(mockUserNoPassword);
      expect(result).toEqual({ access_token: mockToken });

      const expectedPayload = {
        username: mockUserNoPassword.username,
        sub: mockUserNoPassword.id,
      };
      expect(jwtService.sign).toHaveBeenCalledWith(expectedPayload);
    });
  });

  /******************************************
   *        TEST: register()                *
   ******************************************/
  describe('register', () => {
    it('should call UsersService.create to register a new user', async () => {
      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser);

      const result = await authService.register(mockUser);
      expect(result).toEqual({ ...mockUser, password: expect.any(String) });
      expect(usersService.create).toHaveBeenCalledWith({
        username: mockUser.username,
        password: mockUser.password,
      });
    });
  });
});
