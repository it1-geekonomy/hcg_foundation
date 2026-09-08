import { Module } from '@nestjs/common';
import { AnnualReportsModule } from './annual-reports/annual-reports.module';
import { PublicationsModule } from './publications/publications.module';
import { NewslettersModule } from './newsletters/newsletters.module';
import { GalleryModule } from './gallery/gallery.module';
import { ArticlesModule } from './articles/articles.module';
import { BlogsModule } from './blogs/blogs.module';

/**
 * Resources page domain
 * Tables are independent — no FK relations between entities.
 */
@Module({
  imports: [
    AnnualReportsModule,
    PublicationsModule,
    NewslettersModule,
    GalleryModule,
    ArticlesModule,
    BlogsModule,
  ],
  exports: [
    AnnualReportsModule,
    PublicationsModule,
    NewslettersModule,
    GalleryModule,
    ArticlesModule,
    BlogsModule,
  ],
})
export class ResourcesModule {}
