import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { Request } from 'express';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService<AllConfigType>,
  ) {
    super({
      clientID: configService.getOrThrow('googleConfig.clientId', {
        infer: true,
      }),
      clientSecret: configService.getOrThrow('googleConfig.clientSecret', {
        infer: true,
      }),
      callbackURL: configService.getOrThrow('googleConfig.callbackURL', {
        infer: true,
      }),
      passReqToCallback: true,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const user = await this.authService.validateSocialLogin(
      profile,
      'github',
      req,
    );
    done(null, user);
  }
}
