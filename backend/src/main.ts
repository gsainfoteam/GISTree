import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS 설정
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('GIST 연말 쪽지 서비스 API')
    .setDescription('GISTree API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', '인증 관련 API')
    .addTag('users', '사용자 관련 API')
    .addTag('messages', '쪽지 관련 API')
    .addTag('ornaments', '오너먼트 관련 API')
    .addTag('trees', '트리 꾸미기 관련 API')
    .addTag('mailbox', '우편함 관련 API')
    .addTag('notifications', '알림 관련 API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`
🎄 GISTree 서비스 시작:)
🚀 서버 실행 중: http://localhost:${port}
📚 API 명세서: http://localhost:${port}/api
  `);
}
bootstrap();
