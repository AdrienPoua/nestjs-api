import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  username: string;
  password: string;
}

@Injectable()
export class UsersService {
  private readonly users: User[] = [];

  async create(userData: {
    username: string;
    password: string;
  }): Promise<User> {
    if (!userData.username || !userData.password) {
      throw new BadRequestException('Username and password are required');
    }
    if (this.users.find((user) => user.username === userData.username)) {
      throw new BadRequestException('Username already exists');
    }
    const hashedPassword: string = await bcrypt.hash(userData.password, 10);
    const user: User = {
      id: uuidv4(),
      username: userData.username,
      password: hashedPassword,
    };
    this.users.push(user);

    // Retourne l'utilisateur sans son mot de passe
    return { id: user.id, username: user.username, password: user.password };
  }

  async findOne(username: string): Promise<User> {
    const user = this.users.find((user) => user.username === username);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(
    username: string,
    updateData: { username?: string; password?: string },
  ): Promise<User> {
    const user = await this.findOne(username);
    if (user) {
      if (updateData.password) {
        // Si un mot de passe est fourni, le hacher et le mettre à jour
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }
      // Mettre à jour l'utilisateur
      if (updateData.username) {
        user.username = updateData.username;
      }
      // Retourner l'utilisateur mis à jour
      return user;
    }
    throw new NotFoundException('User not found');
  }
}
