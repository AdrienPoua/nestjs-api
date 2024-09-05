import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
export interface User {
  id: string;
  username: string;
}

export interface UserWithPassword extends User {
  password: string;
}

@Injectable()
export class UsersService {
  private readonly users: UserWithPassword[] = [];

  async create(userData: {
    username: string;
    password: string;
  }): Promise<User> {
    const hashedPassword: string = await bcrypt.hash(userData.password, 10);
    const user: UserWithPassword = {
      id: uuidv4(),
      username: userData.username,
      password: hashedPassword,
    };
    this.users.push(user);

    // Retourne l'utilisateur sans son mot de passe
    return { id: user.id, username: user.username };
  }

  async findOne(username: string): Promise<UserWithPassword> {
    const user = this.users.find((user) => user.username === username);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(
    username: string,
    updateData: { username?: string; password?: string },
  ): Promise<UserWithPassword> {
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
