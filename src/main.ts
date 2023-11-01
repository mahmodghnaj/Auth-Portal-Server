import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import validationOptions from './utils/validation-options';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from './config/config.type';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  useContainer(app.select(AppModule), { fallbackOnErrors: true }); // => inject model in class-validator

  const configService = app.get(ConfigService<AllConfigType>);

  app.useGlobalPipes(new ValidationPipe(validationOptions));
  app.use(cookieParser());

  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
    { exclude: ['/'] },
  );

  app.enableCors({
    origin: configService.getOrThrow('app.frontendDomain', { infer: true }),
    credentials: true,
  });

  await app.listen(configService.getOrThrow('app.port', { infer: true }));
}
bootstrap();
