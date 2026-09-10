import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
} from 'typeorm';
import {
  idColumn,
  seoColumns,
  timestampColumns,
  statusIndex,
} from '../migration.helpers';

export class CreatePatientTestimonials1741234567993 implements MigrationInterface {
  name = 'CreatePatientTestimonials1741234567993';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // Drop legacy scaffold if present
    if (await queryRunner.hasTable('patient_testimonials')) {
      const isLegacy =
        (await queryRunner.hasColumn('patient_testimonials', 'image_url')) ||
        (await queryRunner.hasColumn('patient_testimonials', 'is_published'));
      if (isLegacy) {
        await queryRunner.dropTable('patient_testimonials', true);
      } else {
        return;
      }
    }

    await queryRunner.createTable(
      new Table({
        name: 'patient_testimonials',
        columns: [
          idColumn(),
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'patient_testimonial_banner',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'patient_testimonial_mobile_banner',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'patient_testimonial_file',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'published', 'archived'],
            enumName: 'content_status',
            isNullable: false,
            default: `'draft'`,
          },
          ...seoColumns(),
          ...timestampColumns(),
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'patient_testimonials',
      new TableIndex(statusIndex('patient_testimonials')),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('patient_testimonials', true);
  }
}
