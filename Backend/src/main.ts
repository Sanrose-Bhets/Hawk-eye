import { Temporal } from 'temporal-polyfill';
globalThis.Temporal = Temporal;
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { setupSwagger } from './common/swagger/swagger.setup';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);
  const port = process.env.PORT ?? 3000;

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter(app.get('winston')));
  app.useGlobalInterceptors(new LoggingInterceptor(app.get('winston')));
  app.setGlobalPrefix('api/v1');
  setupSwagger(app);

  await app.listen(port);
  logger.log(`Backend running on http://localhost:${port}`, 'Bootstrap');
  logger.log(`Swagger docs on http://localhost:${port}/api`, 'Bootstrap');
}
bootstrap();
