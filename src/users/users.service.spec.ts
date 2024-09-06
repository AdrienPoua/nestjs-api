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
  const user = {
    id: '123',
    username: 'John Doe',
    password: 'password',
  };

  /******************************************
   *        SECTION : Errors handling       *
   ******************************************/

  describe('Test errors cases', () => {
    it('should throw NotFoundException if user is not found', async () => {
      try {
        await service.findOne('non_existing_user');
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
        await service.update('invalid_username', updatedUser);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
    it('should throw BadRequestException if updating with invalid parameters', async () => {
      const updatedUser = {
        username: 'Jeanne',
        invalid: 'invalid', // Paramètre non autorisé
      };

      await service.create(user);

      try {
        await service.update(user.username, updatedUser);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  /******************************************
   *        SECTION : create               *
   ******************************************/

  describe('User creation', () => {
    it('should create a new user and return it with a hashed password', async () => {
      const result = await service.create(user);
      expect(result).toEqual({
        username: user.username,
        id: expect.any(String),
        password: expect.any(String), // Check if the password is hashed
      });
      expect(result.password).not.toBe(user.password); // Check if the password is hashed
    });
  });

  /******************************************
   *        SECTION : findOne               *
   ******************************************/

  describe('User search', () => {
    it('should find a user by username and return it with an id', async () => {
      await service.create(user);
      const result = await service.findOne(user.username);
      expect(result).toEqual({
        username: user.username,
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

      // Ajout de l'utilisateur avant la mise à jour
      await service.create(user);

      const result = await service.update(user.username, updatedUser);
      expect(result).toEqual({
        username: updatedUser.username,
        password:
          expect.any(String) && expect.not.stringContaining(user.password),
        id: expect.any(String),
      });
    });
  });
});
