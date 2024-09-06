import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  const mockUser = { username: 'testuser', password: 'testpassword', id: '1' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(), // Mock des méthodes du service
            login: jest.fn(),
            register: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  /******************************************
   *        SECTION : POST /auth/register     *
   ******************************************/

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      jest.spyOn(authService, 'register').mockResolvedValue(mockUser);

      const result = await authController.register(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  /******************************************
   *        SECTION : POST /auth/login     *
   ******************************************/

  describe('POST /auth/login', () => {
    it('should login a user', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue({
        id: mockUser.id,
        username: mockUser.username,
      });
      jest
        .spyOn(authService, 'login')
        .mockResolvedValue({ access_token: 'testtoken' });

      const result = await authController.login(mockUser);
      expect(result).toEqual({ access_token: 'testtoken' });
    });
  });
});
