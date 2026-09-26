import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  addUpdatedAtTrigger,
  dropUpdatedAtTrigger,
  ensureUpdatedAtFunction,
} from '../migration.helpers';

const TABLES = ['users', 'events', 'donors'];

export class AddUpdatedAtTriggers1741234567990 implements MigrationInterface {
  name = 'AddUpdatedAtTriggers1741234567990';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await ensureUpdatedAtFunction(queryRunner);

    for (const table of TABLES) {
      if (await queryRunner.hasTable(table)) {
        await addUpdatedAtTrigger(queryRunner, table);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES) {
      if (await queryRunner.hasTable(table)) {
        await dropUpdatedAtTrigger(queryRunner, table);
      }
    }
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column()`);
  }
}
