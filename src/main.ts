import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { GlobalErrorFilter } from './filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.useGlobalFilters(new GlobalErrorFilter());
  app.enableCors({
    credentials: true,
    origin: true,
    exposedHeaders: ['access-token', 'refresh-token'],
  });
  app.use(cookieParser('cookieSecret'));
  app.use(helmet());
  app.use(json({ limit: '20mb' }));
  app.use(urlencoded({ extended: true, limit: '20mb' }));
  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: false,
      transform: true,
    }),
  );
  SwaggerModule.setup(
    'api',
    app,
    SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .addCookieAuth()
        .setVersion('1.0')
        .addServer('http://localhost:' + config.get('port'))
        .build(),
    ),
  );

  await app.listen(Number(config.get('port') ?? 5000));
}

bootstrap().catch((e) => console.error(`Server bootstrap failed: ${e.message}`));
