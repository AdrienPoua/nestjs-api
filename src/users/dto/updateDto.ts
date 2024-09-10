import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
