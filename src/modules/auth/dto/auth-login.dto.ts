import { IsNotEmpty, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';
import { IsExist } from 'src/utils/validators/is-exists.validator';

export class AuthEmailLoginDto {
  @IsNotEmpty()
  @Validate(IsExist, ['Users'], {
    message: 'email or password is incorrect',
  })
  @Transform(lowerCaseTransformer)
  email: string;
  @IsNotEmpty()
  password: string;
}
