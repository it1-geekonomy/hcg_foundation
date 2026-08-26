import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Announcement,
  AnnualReport,
  Blog,
  Event,
  News,
  Page,
  PatientStory,
  PatientTestimonial,
  Project,
  Team,
} from './entities/cms-content.entities';

export const CMS_ENTITIES = [
  Blog,
  Event,
  News,
  Page,
  Project,
  PatientStory,
  PatientTestimonial,
  Team,
  Announcement,
  AnnualReport,
];

@Module({
  imports: [TypeOrmModule.forFeature(CMS_ENTITIES)],
  exports: [TypeOrmModule],
})
export class CmsModule {}
