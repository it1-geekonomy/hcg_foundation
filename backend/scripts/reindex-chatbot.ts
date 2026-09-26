
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { IngestionService } from '../src/chatbot/services/ingestion.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ingestionService = app.get(IngestionService);
  
  console.log('Starting reindex...');
  await ingestionService.reindexAll();
  console.log('Reindex completed!');
  await app.close();
}
bootstrap();

