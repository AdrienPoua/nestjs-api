import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

const validationConfig = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe(validationConfig));
  await app.listen(3000);
}
bootstrap();
