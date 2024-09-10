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
import { UpdateDto } from './dto/updateDto';
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get()
  async findOne(@Request() req: { user: { username: string } }) {
    return this.usersService.findOne(req.user.username);
  }

  @UseGuards(AuthGuard)
  @Patch()
  async update(
    @Request() req: { user: { username: string } },
    @Body() updateDto: UpdateDto,
  ) {
    return this.usersService.update(req.user.username, updateDto);
  }
}
