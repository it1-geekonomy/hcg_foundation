import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatbotModule } from './chatbot/chatbot.module';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import {
  AboutModule,
  AdminModule,
  ContactModule,
  DonationModule,
  HomeModule,
  LegalModule,
  ResourcesModule,
} from './modules';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    DatabaseModule,

    // ERD page domains — all tables independent (no FKs)
    AboutModule,
    ResourcesModule,
    HomeModule,
    DonationModule,
    ContactModule,
    LegalModule,
    AdminModule,

    ChatbotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
