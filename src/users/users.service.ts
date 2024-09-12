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
    if (this.users.find((user) => user.username === userData.username)) {
      throw new BadRequestException('Username already exists');
    }
    const hashedPassword = await this.hashPassword(userData.password);
    const user: User = {
      id: uuidv4(),
      username: userData.username,
      password: hashedPassword,
    };
    this.users.push(user);

    // Retourne l'utilisateur sans son mot de passe
    return { id: user.id, username: user.username, password: user.password };
  }

  async findOne(userData: { username: string }): Promise<User> {
    const user = this.users.find((user) => user.username === userData.username);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(updateData: {
    username: string;
    password?: string;
  }): Promise<Omit<User, 'password'>> {
    const user = await this.findOne({ username: updateData.username });

    // Si un mot de passe est fourni, le hacher et le mettre à jour
    if (updateData.password) {
      const hashedPassword = await this.hashPassword(updateData.password);
      user.password = hashedPassword;
    }
    // Mettre à jour l'utilisateur
    if (updateData.username) {
      user.username = updateData.username;
    }

    // Retourner l'utilisateur mis à jour sans le mot de passe
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }
  // Méthode pour hacher le mot de passe
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
