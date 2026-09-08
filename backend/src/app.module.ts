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
  AnnualReportsModule,
  ArticlesModule,
  AuthModule,
  AwardsModule,
  BlogsModule,
  DonorsModule,
  EventsModule,
  GalleryModule,
  LeadsContactModule,
  LegalPagesModule,
  NewslettersModule,
  PatientStoriesModule,
  ProjectsModule,
  PublicationsModule,
  TeamsModule,
  TrusteesModule,
  UsersModule,
} from './modules';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    DatabaseModule,

    // One module per table — independent, no FKs / no page wrappers
    TeamsModule,
    TrusteesModule,
    AwardsModule,
    AnnualReportsModule,
    PublicationsModule,
    NewslettersModule,
    GalleryModule,
    ArticlesModule,
    BlogsModule,
    ProjectsModule,
    EventsModule,
    PatientStoriesModule,
    DonorsModule,
    LeadsContactModule,
    LegalPagesModule,
    UsersModule,
    AuthModule,

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
