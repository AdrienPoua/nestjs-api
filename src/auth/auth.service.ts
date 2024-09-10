import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async login(username: string, pass: string) {
    const user = await this.usersService.findOne(username);
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    if (!bcrypt.compare(pass, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: await this.jwtService.sign(payload, { secret }),
    };
  }

  async createUserAccount(userData: { username: string; password: string }) {
    const { username, password } = userData;
    return this.usersService.create({
      username,
      password,
    });
  }
}
