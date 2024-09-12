import { UserDto } from '../../dto/userDto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateDto extends PartialType(UserDto) {
  username: string;
}
