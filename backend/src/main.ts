import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  app.enableCors();
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('HCG Foundation API')
    .setDescription(
      'CMS + public API for HCG Foundation. Domains map 1:1 to site pages. All tables are independent (no foreign keys).',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 6060;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Application is running on: http://localhost:${port}/api`);
  // eslint-disable-next-line no-console
  console.log(`Swagger docs available at: http://localhost:${port}/api/docs`);
}
bootstrap();
