import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientStoriesController } from './patient-stories.controller';
import { PatientStoriesService } from './patient-stories.service';
import { PatientStory } from './entities/patient-story.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PatientStory])],
  controllers: [PatientStoriesController],
  providers: [PatientStoriesService],
  exports: [PatientStoriesService, TypeOrmModule],
})
export class PatientStoriesModule {}
