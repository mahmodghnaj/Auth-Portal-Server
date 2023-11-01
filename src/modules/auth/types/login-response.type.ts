import { Users } from 'src/modules/users/schemas/users.schema';

export type LoginResponseType = Readonly<{
  token: string;
  refreshToken: string;
  tokenExpires: number;
}>;
export type InfoSession = {
  user: Users;
  token: string;
};
