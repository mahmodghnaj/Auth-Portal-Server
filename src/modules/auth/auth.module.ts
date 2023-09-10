import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SessionModule } from '../session/session.module';
import { IsNotExist } from 'src/utils/validators/is-not-exists.validator';
import { IsExist } from 'src/utils/validators/is-exists.validator';
import { ForgotModule } from '../forgot/forgot.module';
import { MailModule } from '../mail/Mail.module';

@Module({
  imports: [
    UsersModule,
    SessionModule,
    ForgotModule,
    MailModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    IsNotExist,
    IsExist,
    AuthService,
    JwtService,
    JwtStrategy,
    JwtRefreshStrategy,
  ],
})
export class AuthModule {}
