import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadType } from './types/jwt-payload.type';
import { OrNeverType } from 'src/utils/types/or-never.type';
import { AllConfigType } from 'src/config/config.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService<AllConfigType>) {
    super({
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow('auth.secret', { infer: true }),
    });
  }
  public validate(payload: JwtPayloadType): OrNeverType<JwtPayloadType> {
    if (!payload.id) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
