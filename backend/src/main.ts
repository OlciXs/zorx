import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Zorx API')
    .setDescription('API dla rozszerzenia przeglądarki i aplikacji do fiszek Zorx')
    .setVersion('1.0')
    .addTag('users', 'Operacje na użytkownikach i autoryzacja')
    .addTag('categories', 'Zarządzanie kategoriami')
    .addTag('flashcards', 'Zarządzanie fiszkami')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);

  console.log(`🚀 Serwer uruchomiony pod adresem: http://localhost:${PORT}`);
  console.log(`📚 Dokumentacja Swagger UI: http://localhost:${PORT}/api`);
}
bootstrap();