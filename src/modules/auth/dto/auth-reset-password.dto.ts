import { IsNotEmpty, MinLength } from 'class-validator';

export class AuthResetPasswordDto {
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  hash: string;
}
