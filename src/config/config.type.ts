export type AppConfig = {
  nodeEnv: string;
  name: string;
  frontendDomain: string;
  backendDomain: string;
  port: number;
  workingDirectory: string;
  apiPrefix: string;
};

export type AuthConfig = {
  secret: string;
  expires: string;
  refreshSecret: string;
  refreshExpires: string;
  passwordChangeInterval: string;
};
export type DatabaseConfig = {
  databaseUrl: string;
};

export type MailConfig = {
  port: number;
  host?: string;
  user?: string;
  password?: string;
  defaultEmail?: string;
  defaultName?: string;
};
export interface SocialConfig {
  clientId: string;
  clientSecret: string;
  callbackURL: string;
}
export type GoogleConfig = SocialConfig;

export type GithubConfig = SocialConfig;

//all
export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
  auth: AuthConfig;
  mail: MailConfig;
  googleConfig: GoogleConfig;
  githubConfig: GithubConfig;
};
