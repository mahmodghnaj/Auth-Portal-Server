import { IsString, IsEmail, MinLength, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';
import { StatusEnum } from '../schemas/users.schema';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;
  @IsString()
  @IsNotEmpty()
  lastName: string;
  @Transform(lowerCaseTransformer)
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
  status?: number;
  hash?: string | null;
  socialId?: string;
  socialType?: string;
}
