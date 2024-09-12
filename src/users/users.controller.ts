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
  async findOne(@Request() req: { user: { username: string } }) {
    const username = req.user.username;
    return this.usersService.findOne({ username });
  }

  @UseGuards(AuthGuard)
  @Patch()
  async update(
    @Request() req: { user: { username: string } },
    @Body() updateDto: { username: string; password?: string },
  ) {
    return this.usersService.update({
      ...updateDto,
      username: req.user.username,
    });
  }
}
