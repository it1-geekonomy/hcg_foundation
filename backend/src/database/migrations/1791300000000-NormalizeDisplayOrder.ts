import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Renumbers display_order to 1..n per list so move/swap re-ordering starts
 * from a clean sequence (teams were all backfilled to 1). Ties keep the order
 * the CMS showed before. Soft-deleted rows keep their value for restore.
 */
const LISTS: { table: string; partition?: string; tieBreak: string }[] = [
    { table: "teams", partition: "type", tieBreak: "created_at DESC" },
    { table: "awards", tieBreak: "created_at DESC" },
    { table: "projects", tieBreak: "project_date DESC NULLS LAST, created_at DESC" },
    { table: "impact_videos", tieBreak: "created_at DESC" },
    { table: "home_banners", tieBreak: "created_at DESC" },
];

export class NormalizeDisplayOrder1791300000000 implements MigrationInterface {
    name = 'NormalizeDisplayOrder1791300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        for (const { table, partition, tieBreak } of LISTS) {
            await queryRunner.query(`
                UPDATE "${table}" t
                SET display_order = ranked.position
                FROM (
                    SELECT id, ROW_NUMBER() OVER (
                        ${partition ? `PARTITION BY "${partition}"` : ""}
                        ORDER BY display_order ASC, ${tieBreak}
                    ) AS position
                    FROM "${table}"
                    WHERE deleted_at IS NULL
                ) ranked
                WHERE t.id = ranked.id AND t.display_order IS DISTINCT FROM ranked.position
            `);
        }
    }

    public async down(): Promise<void> {
        // Data-only renumbering; the previous (duplicate) values are not recoverable.
    }
}
