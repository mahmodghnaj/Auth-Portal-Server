import { IsEmail, IsNotEmpty, MinLength, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';
import { IsNotExist } from 'src/utils/validators/is-not-exists.validator';

export class AuthRegisterDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @Validate(IsNotExist, ['Users'], {
    message: 'email Already Exists',
  })
  @Transform(lowerCaseTransformer)
  email: string;

  @MinLength(6)
  password: string;
}
