import { Module } from '@nestjs/common';
import { ProjectsModule } from './projects/projects.module';
import { EventsModule } from './events/events.module';
import { PatientStoriesModule } from './patient-stories/patient-stories.module';

/**
 * Home page domain
 * Tables are independent — no FK relations between entities.
 */
@Module({
  imports: [
    ProjectsModule,
    EventsModule,
    PatientStoriesModule,
  ],
  exports: [
    ProjectsModule,
    EventsModule,
    PatientStoriesModule,
  ],
})
export class HomeModule {}
