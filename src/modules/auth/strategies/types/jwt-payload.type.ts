import { SessionDocument } from 'src/modules/session/schemas/session.schema';
import { UsersDocument } from 'src/modules/users/schemas/users.schema';

export type JwtPayloadType = {
  id: UsersDocument['id'];
  sessionId: SessionDocument['id'];
};
export interface JwtPayloadTypeWithRefreshToken extends JwtPayloadType {
  refreshToken: string;
}
