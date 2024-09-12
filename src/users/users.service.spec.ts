import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  /******************************************
   *        SECTION : Initialize data       *
   ******************************************/
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  const mockedUser = {
    id: '123',
    username: 'John Doe',
    password: 'mocked',
  };

  /******************************************
   *        SECTION : Errors handling       *
   ******************************************/

  describe('Test errors cases', () => {
    it('should throw NotFoundException if user is not found', async () => {
      try {
        await service.findOne({ username: 'non_existing_user' });
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
    it('should throw BadRequestException if username or password is missing', async () => {
      const userData = {
        username: '',
        password: 'password',
      };
      try {
        await service.create(userData);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw NotFoundException if updating a non-existing user', async () => {
      const updatedUser = {
        username: 'Jeanne',
        password: '1234',
      };

      try {
        await service.update({ ...updatedUser, username: 'invalid_username' });
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  /******************************************
   *        SECTION : create               *
   ******************************************/

  describe('User creation', () => {
    it('should create a new user and return it with a hashed password', async () => {
      const result = await service.create(mockedUser);
      expect(result).toEqual({
        username: mockedUser.username,
        id: expect.any(String),
        password: expect.any(String), // Check if the password is hashed
      });
      expect(result.password).not.toBe(mockedUser.password); // Check if the password is hashed
    });
  });

  /******************************************
   *        SECTION : findOne               *
   ******************************************/

  describe('User search', () => {
    it('should find a user by username and return it with an id', async () => {
      await service.create(mockedUser);
      const result = await service.findOne({ username: mockedUser.username });
      expect(result).toEqual({
        username: mockedUser.username,
        id: expect.any(String),
        password: expect.any(String),
      });
    });
  });

  /******************************************
   *        SECTION : update               *
   ******************************************/

  describe('User update', () => {
    it('should update a user and return it with the updated parameters', async () => {
      const updatedUser = {
        username: 'Jeanne',
        password: '1234',
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockedUser);
      jest.spyOn(service, 'findOne').mockResolvedValue(mockedUser);

      const result = await service.update(updatedUser);
      expect(result).toEqual({
        username: updatedUser.username,
        id: expect.any(String),
      });
    });
  });
});
