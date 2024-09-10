import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  const JWT_MOCKED_TOKEN = 'jwt-mocked-token';
  const mockUser = { username: 'testuser', password: 'testpassword', id: '1' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            createUserAccount: jest.fn(),
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
      jest.spyOn(authService, 'createUserAccount').mockResolvedValue(mockUser);

      const result = await authController.register({
        username: mockUser.username,
        password: mockUser.password,
      });
      expect(result).toEqual(mockUser);
    });
  });

  /******************************************
   *        SECTION : POST /auth/login     *
   ******************************************/

  describe('POST /auth/login', () => {
    it('should login a user', async () => {
      jest.spyOn(authService, 'login').mockResolvedValue({
        access_token: JWT_MOCKED_TOKEN,
      });

      const result = await authController.login({
        username: mockUser.username,
        password: mockUser.password,
      });
      expect(result).toEqual({ access_token: JWT_MOCKED_TOKEN });
    });
  });
});
