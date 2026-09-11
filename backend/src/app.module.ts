import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatbotModule } from './chatbot/chatbot.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import configuration from './config/configuration';
import { StorageModule } from './common/storage/storage.module';
import { DatabaseModule } from './database/database.module';
import { AnnualReportsModule } from './modules/annual-reports/annual-reports.module';
import { AuthModule } from './modules/auth/auth.module';
import { BlogsModule } from './modules/blogs/blogs.module';
import { DonorsModule } from './modules/donors/donors.module';
import { EventsModule } from './modules/events/events.module';
import { FundraisingCampaignsModule } from './modules/fundraising-campaigns/fundraising-campaigns.module';
import { PartnershipInquiriesModule } from './modules/partnership-inquiries/partnership-inquiries.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    DatabaseModule,
    StorageModule,
    EventsModule,
    AnnualReportsModule,
    BlogsModule,
    DonorsModule,
    FundraisingCampaignsModule,
    PartnershipInquiriesModule,
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
