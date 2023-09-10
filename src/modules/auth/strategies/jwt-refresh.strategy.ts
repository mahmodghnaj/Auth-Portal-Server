import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { Request } from 'express';
import {
  JwtPayloadType,
  JwtPayloadTypeWithRefreshToken,
} from './types/jwt-payload.type';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private configService: ConfigService<AllConfigType>) {
    super({
      jwtFromRequest: (req: Request) => {
        if (req.headers['user-agent']) {
          // Request comes from web
          return req.cookies['refreshToken']; // Extract from cookie
        } else {
          // Request comes from mobile or any other source
          return ExtractJwt.fromAuthHeaderAsBearerToken()(req); // Extract from request headers
        }
      },
      secretOrKey: configService.get('auth.refreshSecret', { infer: true }),
      ignoreExpiration: true,
      passReqToCallback: true,
    });
  }

  public validate(req: Request, payload: JwtPayloadTypeWithRefreshToken) {
    if (!payload) {
      throw new UnauthorizedException();
    }
    const refreshToken = this.getRefreshToken(req);
    payload.refreshToken = refreshToken;

    return payload;
  }
  private getRefreshToken(req: Request): string {
    if (req.headers['user-agent']) {
      return req.cookies['refreshToken'];
    } else {
      return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    }
  }
}
