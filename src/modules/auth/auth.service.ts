import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthEmailLoginDto } from './dto/auth-login.dto';
import { AuthRegisterDto } from './dto/auth-register.dto';
import bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InfoSession, LoginResponseType } from './types/login-response.type';
import { Request, Response } from 'express';
import { StatusEnum, UsersDocument } from '../users/schemas/users.schema';
import {
  JwtPayloadType,
  JwtPayloadTypeWithRefreshToken,
} from './strategies/types/jwt-payload.type';
import { NullableType } from 'src/utils/types/nullable.type';
import ms from 'ms';
import { SessionService } from '../session/session.service';
import crypto from 'crypto';
import { uid } from 'uid';
import { ForgotService } from '../forgot/forgot.service';
import { MailService } from '../mail/Mail.service';
import { SessionDocument } from '../session/schemas/session.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private jwtService: JwtService,
    private sessionService: SessionService,
    private forgotService: ForgotService,
    private mailService: MailService,
  ) {}

  async register(dto: AuthRegisterDto): Promise<LoginResponseType> {
    const hash = crypto.createHash('sha256').update(uid(21)).digest('hex');
    const user = await this.usersService.createUser({
      ...dto,
      hash,
      status: StatusEnum.inactive,
    });
    const session = await this.sessionService.create({
      user: user.id,
    });
    await this.mailService.userSignUp({
      to: dto.email,
      data: {
        hash,
      },
    });
    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: user.id,
      sessionId: session.id,
    });
    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }

  async confirmEmail(hash: string): Promise<void> {
    const user = await this.usersService.validateUser({
      hash,
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }
    await this.usersService.update(user.id, {
      status: StatusEnum.active,
      hash: null,
    });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findOne({
      email,
    });
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    if (user.lastPasswordChange) {
      // Check if the user can change the password
      const currentTime = new Date();
      const lastPasswordChange = user.lastPasswordChange;
      const timeSinceLastChange =
        currentTime.getTime() - lastPasswordChange.getTime();
      const changePasswordInterval =
        Date.now() +
        ms(
          this.configService.getOrThrow('auth.passwordChangeInterval', {
            infer: true,
          }),
        );

      if (timeSinceLastChange < Number(changePasswordInterval)) {
        throw new HttpException(
          'You can change your password once every 3 days',
          400,
        );
      }
    }

    const isFound = await this.forgotService.findOne({
      user: user.id,
      expires: { $gt: new Date() },
    });
    if (isFound)
      throw new HttpException(
        'a password reset request is already pending.',
        400,
      );

    const hash = crypto.createHash('sha256').update(uid(21)).digest('hex');
    const hashExpiresIn = this.configService.getOrThrow(
      'auth.hashForgotExpires',
      {
        infer: true,
      },
    );
    const hashExpires = Number(Date.now() + ms(hashExpiresIn));
    const expires = new Date(hashExpires);
    await this.forgotService.create({
      hash,
      user,
      expires,
    });
    await this.mailService.forgotPassword({
      to: email,
      data: {
        hash,
      },
    });
  }

  async resetPassword(hash: string, password: string): Promise<void> {
    const forgot = await this.forgotService.findOne({
      hash,
      expires: { $gt: new Date() },
    });
    if (!forgot || forgot.deletedAt) {
      throw new HttpException('expired token', 400);
    }
    const user = forgot.user;
    try {
      await this.usersService.update(user, {
        password,
        refreshToken: [],
        lastPasswordChange: new Date(),
      });
      await this.sessionService.softDelete(user);
      await this.forgotService.softDelete(forgot.id);
    } catch (error) {
      throw new InternalServerErrorException(
        'Password reset failed',
        error.message,
      );
    }
  }

  async validateLogin(
    dtoLogin: AuthEmailLoginDto,
    req: Request,
  ): Promise<LoginResponseType> {
    const cookies = req.cookies;

    const user = await this.usersService.validateUser({
      email: dtoLogin.email,
    });

    // evaluate password
    const isValidPassword = await bcrypt.compare(
      dtoLogin.password,
      user.password,
    );
    if (!isValidPassword) {
      throw new HttpException('email or password is incorrect ', 400);
    }

    let oldRefreshTokenArray = cookies?.refreshToken
      ? user.refreshToken.filter((rt) => rt !== cookies.refreshToken)
      : user.refreshToken;

    let sessionId = null;

    if (cookies?.refreshToken) {
      /* 
                 Scenario added here: 
                1) User logs in but never uses RT and does not logout 
                2) RT is stolen
                3) If 1 & 2, reuse detection is needed to clear all RTs when user logs in
       */
      const refreshToken = cookies.refreshToken;
      const foundToken = await this.usersService.findOne({ refreshToken });

      // Detected refresh token reuse!
      if (!foundToken) {
        // clear out ALL previous refresh tokens
        oldRefreshTokenArray = [];
        const session = await this.sessionService.create({
          user: user.id,
        });
        sessionId = session.id;
      } else if (user.refreshToken.includes(refreshToken)) {
        try {
          const info = await this.jwtService.verify(refreshToken, {
            secret: this.configService.get('auth.refreshSecret'),
          });
          sessionId = info.sessionId;
        } catch (error) {
          sessionId = null;
        }
      }
    }

    if (!sessionId) {
      const session = await this.sessionService.create({
        user: user.id,
      });
      sessionId = session.id;
    }

    const { token, refreshToken, tokenExpires } = await this.getTokensData(
      {
        id: user.id,
        sessionId: sessionId,
      },
      oldRefreshTokenArray,
    );
    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }

  async refreshToken(
    payload: JwtPayloadTypeWithRefreshToken,
  ): Promise<LoginResponseType> {
    const user = await this.usersService.validateUser({
      refreshToken: payload.refreshToken,
    });
    // Detected refresh token reuse!
    if (!user) {
      //hackedUser
      await this.usersService.update(payload.id, {
        refreshToken: [],
      });
      await this.sessionService.softDelete(payload.sessionId);
      throw new HttpException('Unauthorized', 401);
    }

    if (!user.refreshToken.includes(payload.refreshToken)) {
      throw new HttpException('Unauthorized', 401);
    }

    const oldRefreshTokenArray = user.refreshToken.filter(
      (refreshToken) => refreshToken !== payload.refreshToken,
    );

    const { token, refreshToken, tokenExpires } = await this.getTokensData(
      {
        id: user.id,
        sessionId: payload.sessionId,
      },
      oldRefreshTokenArray,
    );
    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }
  async infoSession(
    payload: JwtPayloadTypeWithRefreshToken,
  ): Promise<InfoSession> {
    const foundToken = await this.usersService.findOne({
      refreshToken: payload.refreshToken,
    });
    if (!foundToken) throw new UnauthorizedException();
    const { token, user } = await this.sessionService.infoSession({
      _id: payload.sessionId,
    });
    return { token, user };
  }
  async me(
    userJwtPayload: JwtPayloadType,
  ): Promise<NullableType<UsersDocument>> {
    return this.usersService.findOne({
      _id: userJwtPayload.id,
    });
  }
  async logout(data: JwtPayloadType) {
    return await this.sessionService.softDelete(data.sessionId);
  }
  private async getTokensData(
    data: JwtPayloadType,
    oldRefreshTokenArray: string[] = [],
  ) {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });

    const tokenExpires = Number(Date.now() + ms(tokenExpiresIn));

    const [token, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(data, {
        secret: this.configService.getOrThrow('auth.secret', { infer: true }),
        expiresIn: tokenExpiresIn,
      }),
      await this.jwtService.signAsync(data, {
        secret: this.configService.getOrThrow('auth.refreshSecret', {
          infer: true,
        }),
        expiresIn: this.configService.getOrThrow('auth.refreshExpires', {
          infer: true,
        }),
      }),
    ]);
    const newRefreshTokenArray = [...oldRefreshTokenArray, refreshToken];
    await this.usersService.update(data.id, {
      refreshToken: newRefreshTokenArray,
    });
    await this.sessionService.update(data.sessionId, { token });
    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }
  setCookie(
    res: Response,
    cookieName: string,
    cookieValue: string,
    maxAge: number,
  ) {
    const maxAgeInMilliseconds = Number(ms(maxAge));
    res.cookie(cookieName, cookieValue, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: maxAgeInMilliseconds,
      
      
    });
  }
}
