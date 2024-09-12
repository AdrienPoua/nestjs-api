import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from '../dto/userDto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() userDto: UserDto) {
    return this.authService.createUserAccount(userDto);
  }

  @Post('login')
  async login(
    @Body()
    userDto: UserDto,
  ) {
    return this.authService.login(userDto);
  }
}
