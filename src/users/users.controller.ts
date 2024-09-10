import {
  Controller,
  Patch,
  Body,
  Request,
  UseGuards,
  Get,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.gard';
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get()
  async get(@Request() req: { user: { username: string } }) {
    return this.usersService.findOne(req.user.username);
  }

  @UseGuards(AuthGuard)
  @Patch()
  async update(
    @Request() req: { user: { username: string } },
    @Body() body: { username?: string; password?: string },
  ) {
    return this.usersService.update(req.user.username, body);
  }
}
