import { IsString, IsNotEmpty } from 'class-validator';
export class UserDto {
  @IsString()
  @IsNotEmpty()
  username: string;
  @IsString()
  @IsNotEmpty()
  password: string;
}
