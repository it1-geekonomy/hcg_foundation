import { Module } from '@nestjs/common';
import { TeamsModule } from './teams/teams.module';
import { TrusteesModule } from './trustees/trustees.module';
import { AwardsModule } from './awards/awards.module';

/**
 * About Us page domain
 * Tables are independent — no FK relations between entities.
 */
@Module({
  imports: [
    TeamsModule,
    TrusteesModule,
    AwardsModule,
  ],
  exports: [
    TeamsModule,
    TrusteesModule,
    AwardsModule,
  ],
})
export class AboutModule {}
