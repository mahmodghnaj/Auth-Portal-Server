import { registerAs } from '@nestjs/config';
import { GithubConfig } from './config.type';
import { IsString } from 'class-validator';
import validateConfig from 'src/utils/validate-config';

class EnvironmentVariablesValidator {
  @IsString()
  CLIENT_ID_GITHUB: string;
  @IsString()
  CLIENT_SECRET_GITHUB: string;
  @IsString()
  CLIENT_CALL_BACK_GITHUB: string;
}

export default registerAs<GithubConfig>('githubConfig', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    clientId: process.env.CLIENT_ID_GITHUB,
    clientSecret: process.env.CLIENT_SECRET_GITHUB,
    callbackURL: process.env.CLIENT_CALL_BACK_GITHUB,
  };
});
