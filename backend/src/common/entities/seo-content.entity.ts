import { Column } from 'typeorm';
import { BaseEntity } from './base.entity';

/**
 * Base for page/content tables that support CMS SEO meta tags.
 * Not used by admin users.
 */
export abstract class SeoContentEntity extends BaseEntity {
  @Column({ name: 'meta_title', type: 'varchar', length: 255, nullable: true })
  metaTitle?: string | null;

  @Column({ name: 'meta_description', type: 'text', nullable: true })
  metaDescription?: string | null;

  @Column({ name: 'schema_code', type: 'text', nullable: true })
  schemaCode?: string | null;
}
