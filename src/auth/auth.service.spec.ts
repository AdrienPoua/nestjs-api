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
  const MOCKED_JWT_TOKEN = 'signed-jwt-token';

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
   *        TEST: login()                   *
   ******************************************/
  describe('login', () => {
    it('should return a JWT token', async () => {
      // Mock le retour de la méthode sign de JwtService
      jest.spyOn(jwtService, 'sign').mockReturnValue(MOCKED_JWT_TOKEN);

      // Mock de bcrypt pour simuler la comparaison réussie des mots de passe

      jest.spyOn(bcrypt as any, 'compare').mockResolvedValueOnce(true);

      // Simuler la récupération d'un utilisateur avec un mot de passe hashé
      const mockUserWithHashedPassword = {
        ...mockUser,
        password: await bcrypt.hash(mockUser.password, 10), // Ajoute un mot de passe hashé
      };

      // Mock de findOne pour renvoyer l'utilisateur simulé
      jest
        .spyOn(usersService, 'findOne')
        .mockResolvedValue(mockUserWithHashedPassword);

      // Appel de la méthode login
      const result = await authService.login(
        mockUser.username,
        mockUser.password,
      );

      // Vérification du résultat
      expect(result).toEqual({ access_token: MOCKED_JWT_TOKEN });

      // Vérification du payload passé à jwtService.sign
      const expectedPayload = {
        username: mockUser.username,
        sub: mockUser.id,
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

      const result = await authService.createUserAccount(mockUser);
      expect(result).toEqual({ ...mockUser, password: expect.any(String) });
      expect(usersService.create).toHaveBeenCalledWith({
        username: mockUser.username,
        password: mockUser.password,
      });
    });
  });
});
