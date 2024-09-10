import { AuthGuard } from './../auth/auth.gard';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  /******************************************
   *        SECTION : initialisation       *
   ******************************************/

  const mockUser = { username: 'John Doe', password: 'password', id: '1' };
  const mockReq = { user: { username: 'John Doe' } };
  const mockUpdatedUser = {
    username: 'UpdatedUser',
    password: 'updatedPassword',
  };
  const mockUpdatedUserWithId = {
    ...mockUpdatedUser,
    id: '1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn(() => true), // Mock JwtAuthGuard pour autoriser l'accès
      })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  /******************************************
   *        SECTION : test routes           *
   ******************************************/

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('test routes', () => {
    it('should return a user when authenticated', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
      const result = await controller.findOne(mockReq);
      expect(usersService.findOne).toHaveBeenCalledWith(mockUser.username);
      expect(result).toEqual(mockUser);
    });

    it('should return the updated user when authenticated', async () => {
      jest
        .spyOn(usersService, 'update')
        .mockResolvedValue(mockUpdatedUserWithId);
      const result = await controller.update(mockReq, mockUpdatedUser);
      expect(result).toEqual({
        id: expect.any(String),
        username: mockUpdatedUser.username,
        password: expect.any(String),
      });
      expect(usersService.update).toHaveBeenCalledWith(
        mockUser.username,
        mockUpdatedUser,
      );
    });
  });
});
