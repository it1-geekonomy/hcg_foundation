import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatbotModule } from './chatbot/chatbot.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
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

    // Each domain module owns its table(s) — independent, no FKs
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
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
