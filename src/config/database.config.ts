import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';

import validateConfig from 'src/utils/validate-config';
import { DatabaseConfig } from './config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  DATABASE_URL: string;
}
export default registerAs<DatabaseConfig>('database', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);
  return {
    databaseUrl: process.env.DATABASE_URL,
  };
});
