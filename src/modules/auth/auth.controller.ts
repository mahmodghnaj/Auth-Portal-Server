import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { Public } from 'src/utils/decorators/public';
import { NullableType } from 'src/utils/types/nullable.type';
import { UsersDocument } from '../users/schemas/users.schema';
import { AuthService } from './auth.service';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { LoginResponseType } from './types/login-response.type';
import { AuthEmailLoginDto } from './dto/auth-login.dto';
import { AuthConfirmEmailDto } from './dto/auth-confirm-email.dto';
import { AuthForgotPasswordDto } from './dto/auth-forgot-password.dto';
import { AuthResetPasswordDto } from './dto/auth-reset-password.dto';
import { AllConfigType } from 'src/config/config.type';
import ms from 'ms';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService<AllConfigType>,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() createUserDto: AuthRegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseType> {
    const res = await this.authService.register(createUserDto);

    this.authService.setCookie(
      response,
      'refreshToken',
      res.refreshToken,
      this.configService.getOrThrow('auth.refreshExpires', {
        infer: true,
      }),
    );

    return res;
  }

  @Public()
  @Post('email/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmEmail(
    @Body() confirmEmailDto: AuthConfirmEmailDto,
  ): Promise<void> {
    return this.authService.confirmEmail(confirmEmailDto.hash);
  }

  @Public()
  @Post('forgot/password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() forgotPasswordDto: AuthForgotPasswordDto,
  ): Promise<void> {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @Post('reset/password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() resetPasswordDto: AuthResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(
      resetPasswordDto.hash,
      resetPasswordDto.password,
    );
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Request() req,
    @Res({ passthrough: true }) response: Response,
    @Body() createUserDto: AuthEmailLoginDto,
  ): Promise<LoginResponseType> {
    const res = await this.authService.validateLogin(
      { email: createUserDto.email, password: createUserDto.password },
      req,
    );

    this.authService.setCookie(
      response,
      'refreshToken',
      res.refreshToken,
      this.configService.getOrThrow('auth.refreshExpires', {
        infer: true,
      }),
    );

    return res;
  }

  @Public()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Request() req,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseType> {
    const res = await this.authService.refreshToken(req.user);
    this.authService.setCookie(
      response,
      'refreshToken',
      res.refreshToken,
      this.configService.getOrThrow('auth.refreshExpires', {
        infer: true,
      }),
    );
    return res;
  }

  @Public()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('info-session')
  @HttpCode(HttpStatus.OK)
  async infoSession(@Request() req) {
    const res = await this.authService.infoSession(req.user);
    return res;
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async me(@Request() request): Promise<NullableType<UsersDocument>> {
    return await this.authService.me(request.user);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  public async logout(
    @Request() request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.logout(request.user);
    response.clearCookie('refreshToken');
  }

  ///social media

  // 1-github
  @Public()
  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubLogin() {}
  ///callback github
  @Public()
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubLoginCallback(@Req() req, @Res() res) {
    const redirectUrl = this.generateRedirectUrl(req.user);
    return res.redirect(redirectUrl);
  }
  // 2-google
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  ///callback google
  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(@Req() req, @Res() res) {
    const redirectUrl = this.generateRedirectUrl(req.user);
    return res.redirect(redirectUrl);
  }

  private generateRedirectUrl(user: any): string {
    const frontendDomain = this.configService.get('app.frontendDomain', {
      infer: true,
    });
    const refreshExpires = Number(
      ms(this.configService.getOrThrow('auth.refreshExpires', { infer: true })),
    );
    return `${frontendDomain}/auth/social?token=${user.token}&refreshToken=${user.refreshToken}&expiresIn=${refreshExpires}`;
  }
}
