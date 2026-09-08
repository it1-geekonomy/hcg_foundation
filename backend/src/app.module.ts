import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatbotModule } from './chatbot/chatbot.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AnnualReportsModule } from './modules/annual-reports/annual-reports.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { AuthModule } from './modules/auth/auth.module';
import { AwardsModule } from './modules/awards/awards.module';
import { BlogsModule } from './modules/blogs/blogs.module';
import { DonorsModule } from './modules/donors/donors.module';
import { EventsModule } from './modules/events/events.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { LeadsContactModule } from './modules/leads-contact/leads-contact.module';
import { LegalPagesModule } from './modules/legal-pages/legal-pages.module';
import { NewslettersModule } from './modules/newsletters/newsletters.module';
import { PatientStoriesModule } from './modules/patient-stories/patient-stories.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { PublicationsModule } from './modules/publications/publications.module';
import { TeamsModule } from './modules/teams/teams.module';
import { TrusteesModule } from './modules/trustees/trustees.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    DatabaseModule,

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
