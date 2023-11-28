import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import AuthConfig from './config/auth.config';
import DatabaseConfig from './config/database.config';
import GoogleConfig from './config/google.config';
import GithubConfig from './config/github.config';
import AppConfig from './config/app.config';
import { AllConfigType } from './config/config.type';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guard/jwt-auth.guard';
import { transformToJSONWithId } from './utils/mongo-plugin';
import { SessionModule } from './modules/session/session.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { MailModule } from './modules/mail/Mail.module';
import MailConfig from './config/mail.config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        AppConfig,
        DatabaseConfig,
        AuthConfig,
        MailConfig,
        GoogleConfig,
        GithubConfig,
      ],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<AllConfigType>) => {
        const databaseUrl = configService.get('database.databaseUrl', {
          infer: true,
        });
        const mongooseOptions = {
          uri: databaseUrl,
          connectionFactory: (connection) => {
            connection.plugin(transformToJSONWithId);
            return connection;
          },
        };
        return mongooseOptions;
      },
    }),
    SessionModule,
    AuthModule,
    UsersModule,
    MailerModule,
    MailModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
