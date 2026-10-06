import { BadRequestException } from '@nestjs/common';
import { EntityManager, ObjectLiteral, Repository } from 'typeorm';

/**
 * Ordered CMS lists (team, trustees, awards, projects, banners, impact videos)
 * keep display_order as 1..n among non-deleted rows of one scope (e.g. per team
 * type). Changing a row's order moves the others to make room instead of
 * rejecting numbers that are already taken.
 */

export type DisplayOrderMode = 'move' | 'swap';
type Scope = Record<string, unknown> | undefined;
type OrderedEntity = ObjectLiteral & { id?: string; displayOrder?: number | null };

function tableName(repo: Repository<ObjectLiteral>): string {
  return repo.metadata.tableName;
}

function column(repo: Repository<ObjectLiteral>, property: string): string {
  return repo.metadata.findColumnWithPropertyName(property)?.databaseName ?? property;
}

function scopeSql(
  repo: Repository<ObjectLiteral>,
  scope: Scope,
  params: unknown[],
): string {
  return Object.entries(scope ?? {})
    .map(([key, value]) => {
      params.push(value);
      return ` AND "${column(repo, key)}" = $${params.length}`;
    })
    .join('');
}

/** Serialises order changes per list, including inserts into an empty one. */
async function lockScope(
  manager: EntityManager,
  repo: Repository<ObjectLiteral>,
  scope: Scope,
): Promise<void> {
  const key = `display_order:${tableName(repo)}:${JSON.stringify(scope ?? {})}`;
  await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [key]);
}

async function countActive(
  manager: EntityManager,
  repo: Repository<ObjectLiteral>,
  scope: Scope,
  excludeId?: string,
): Promise<number> {
  const params: unknown[] = [];
  let sql = `SELECT COUNT(*)::int AS n FROM "${tableName(repo)}" WHERE deleted_at IS NULL`;
  if (excludeId) {
    params.push(excludeId);
    sql += ` AND id != $${params.length}`;
  }
  sql += scopeSql(repo, scope, params);
  const rows: { n: number }[] = await manager.query(sql, params);
  return Number(rows[0]?.n ?? 0);
}

/** Adds `delta` to display_order of active rows in [from, to] (either bound optional). */
async function shift(
  manager: EntityManager,
  repo: Repository<ObjectLiteral>,
  scope: Scope,
  delta: 1 | -1,
  range: { from?: number; to?: number },
  excludeId?: string,
): Promise<void> {
  const params: unknown[] = [delta];
  let sql =
    `UPDATE "${tableName(repo)}" SET display_order = display_order + $1 ` +
    `WHERE deleted_at IS NULL`;
  if (range.from !== undefined) {
    params.push(range.from);
    sql += ` AND display_order >= $${params.length}`;
  }
  if (range.to !== undefined) {
    params.push(range.to);
    sql += ` AND display_order <= $${params.length}`;
  }
  if (excludeId) {
    params.push(excludeId);
    sql += ` AND id != $${params.length}`;
  }
  sql += scopeSql(repo, scope, params);
  await manager.query(sql, params);
}

function clamp(value: number, max: number): number {
  return Math.min(Math.max(1, Math.trunc(value)), Math.max(1, max));
}

/** Rejects positions that don't exist in the list instead of silently changing them. */
function requireInRange(requested: number, max: number): number {
  const value = Math.trunc(requested);
  if (value >= 1 && value <= max) return value;
  throw new BadRequestException(
    max <= 1
      ? `Display order ${requested} is not available: this list has only 1 position, so use 1.`
      : `Display order ${requested} is not available: choose a position from 1 to ${max}.`,
  );
}

/**
 * Saves a new row at `requested` (or at the end), moving rows at that
 * position and after it down by one.
 */
export async function insertWithDisplayOrder<T extends OrderedEntity>(
  repo: Repository<T>,
  entity: T,
  requested: number | null | undefined,
  scope?: Scope,
): Promise<T> {
  const base = repo as unknown as Repository<ObjectLiteral>;
  return repo.manager.transaction(async (manager) => {
    await lockScope(manager, base, scope);
    const count = await countActive(manager, base, scope);
    const target = requested == null ? count + 1 : requireInRange(requested, count + 1);
    await shift(manager, base, scope, 1, { from: target });
    (entity as OrderedEntity).displayOrder = target;
    return manager.save(repo.target, entity) as Promise<T>;
  });
}

export type DisplayOrderChange = {
  /** Order and scope the row had before this update. */
  previousOrder: number | null | undefined;
  previousScope?: Scope;
  /** Requested order; undefined keeps the current one (or appends when the scope changed). */
  requested?: number | null;
  /** Scope after this update (e.g. the new team type). */
  scope?: Scope;
  mode?: DisplayOrderMode;
};

/**
 * Saves an updated row, re-ordering its list:
 * - move (default): the row takes the requested position and the rows in
 *   between shift by one (1,2,3,4 → moving 3 to 1 gives 3,1,2,4);
 * - swap: the row trades positions with the row at the requested position;
 * - scope change (e.g. team → trustee): the gap in the old list closes and
 *   the row is placed in the new list at the requested position or the end.
 */
export async function saveWithDisplayOrder<T extends OrderedEntity>(
  repo: Repository<T>,
  entity: T,
  change: DisplayOrderChange,
): Promise<T> {
  const base = repo as unknown as Repository<ObjectLiteral>;
  const id = String(entity.id);
  const sameScope =
    JSON.stringify(change.previousScope ?? {}) === JSON.stringify(change.scope ?? {});
  const previous = change.previousOrder ?? undefined;

  if (sameScope && (change.requested == null || change.requested === previous)) {
    return repo.save(entity);
  }

  return repo.manager.transaction(async (manager) => {
    const scopes = sameScope ? [change.scope] : [change.previousScope, change.scope];
    // Fixed lock order so two opposite scope changes cannot deadlock
    for (const s of scopes.sort((a, b) =>
      JSON.stringify(a ?? {}).localeCompare(JSON.stringify(b ?? {})),
    )) {
      await lockScope(manager, base, s);
    }

    let target: number;
    if (!sameScope) {
      if (previous !== undefined) {
        await shift(manager, base, change.previousScope, -1, { from: previous + 1 }, id);
      }
      const others = await countActive(manager, base, change.scope, id);
      target =
        change.requested == null ? others + 1 : requireInRange(change.requested, others + 1);
      await shift(manager, base, change.scope, 1, { from: target }, id);
    } else {
      const total = await countActive(manager, base, change.scope);
      target = requireInRange(change.requested as number, total);
      if (previous === undefined) {
        await shift(manager, base, change.scope, 1, { from: target }, id);
      } else if (change.mode === 'swap') {
        const params: unknown[] = [previous, target, id];
        await manager.query(
          `UPDATE "${tableName(base)}" SET display_order = $1 ` +
            `WHERE deleted_at IS NULL AND display_order = $2 AND id != $3` +
            scopeSql(base, change.scope, params),
          params,
        );
      } else if (target < previous) {
        await shift(manager, base, change.scope, 1, { from: target, to: previous - 1 }, id);
      } else if (target > previous) {
        await shift(manager, base, change.scope, -1, { from: previous + 1, to: target }, id);
      }
    }

    (entity as OrderedEntity).displayOrder = target;
    return manager.save(repo.target, entity) as Promise<T>;
  });
}

/** After soft-delete: 2→1, 3→2, etc. for rows above the removed slot. */
export async function compactDisplayOrderAfterDelete<T extends ObjectLiteral>(
  repo: Repository<T>,
  deletedOrder: number | null | undefined,
  scope?: Scope,
): Promise<void> {
  if (deletedOrder == null) return;
  const base = repo as unknown as Repository<ObjectLiteral>;
  await repo.manager.transaction(async (manager) => {
    await lockScope(manager, base, scope);
    await shift(manager, base, scope, -1, { from: deletedOrder + 1 });
  });
}

/**
 * Put a restored row back at its original display_order (clamped to the end
 * of the list), moving the rows from that position down by one.
 */
export async function assignDisplayOrderOnRestore<T extends OrderedEntity>(
  repo: Repository<T>,
  entity: T & { id: string },
  scope?: Scope,
): Promise<T> {
  const base = repo as unknown as Repository<ObjectLiteral>;
  return repo.manager.transaction(async (manager) => {
    await lockScope(manager, base, scope);
    const others = await countActive(manager, base, scope, entity.id);
    const target = clamp(entity.displayOrder ?? 1, others + 1);
    await shift(manager, base, scope, 1, { from: target }, entity.id);
    (entity as OrderedEntity).displayOrder = target;
    return manager.save(repo.target, entity) as Promise<T>;
  });
}
