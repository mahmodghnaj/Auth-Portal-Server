import { Injectable, Req } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-github';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { Request } from 'express';
@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService<AllConfigType>,
  ) {
    super({
      clientID: configService.getOrThrow('githubConfig.clientId', {
        infer: true,
      }),
      clientSecret: configService.getOrThrow('githubConfig.clientSecret', {
        infer: true,
      }),
      callbackURL: configService.getOrThrow('githubConfig.callbackURL', {
        infer: true,
      }),
      scope: ['user:email'],
      passReqToCallback: true,
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
