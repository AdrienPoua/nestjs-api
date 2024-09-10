import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { SECRET } from '../secret';
import { LoginDto } from './dto/loginDto';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    const user = await this.usersService.findOne(username);
    if (!SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    if (!bcrypt.compare(password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, { secret: SECRET }),
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
