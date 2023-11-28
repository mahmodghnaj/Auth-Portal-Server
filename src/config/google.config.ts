import { registerAs } from '@nestjs/config';
import { GoogleConfig } from './config.type';
import { IsString } from 'class-validator';
import validateConfig from 'src/utils/validate-config';

class EnvironmentVariablesValidator {
  @IsString()
  CLIENT_ID_GOOGLE: string;
  @IsString()
  CLIENT_SECRET_GOOGLE: string;
  @IsString()
  CLIENT_CALL_BACK_GOOGLE: string;
}

export default registerAs<GoogleConfig>('googleConfig', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    clientId: process.env.CLIENT_ID_GOOGLE,
    clientSecret: process.env.CLIENT_SECRET_GOOGLE,
    callbackURL: process.env.CLIENT_CALL_BACK_GOOGLE,
  };
});
