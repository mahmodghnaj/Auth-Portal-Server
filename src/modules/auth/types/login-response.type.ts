export type LoginResponseType = Readonly<{
  token: string;
  refreshToken: string;
  tokenExpires: number;
}>;
