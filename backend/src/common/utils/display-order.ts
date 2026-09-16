import { ObjectLiteral, Repository } from 'typeorm';

function tableName(repo: Repository<ObjectLiteral>): string {
  return repo.metadata.tableName;
}

/** Highest display_order among non-deleted rows (0 if none). */
export async function getActiveMaxDisplayOrder(
  repo: Repository<ObjectLiteral>,
): Promise<number> {
  const row = await repo
    .createQueryBuilder('entity')
    .select('MAX(entity.displayOrder)', 'max')
    .where('entity.deletedAt IS NULL')
    .getRawOne<{ max: string | null }>();
  return Number(row?.max ?? 0);
}

/**
 * Pick order for a new row and shift siblings so orders stay unique 1..n.
 * Omit `requested` to append at the end.
 */
export async function prepareInsertDisplayOrder(
  repo: Repository<ObjectLiteral>,
  requested?: number,
): Promise<number> {
  const max = await getActiveMaxDisplayOrder(repo);
  if (requested === undefined || requested === null) {
    return max + 1;
  }

  const order = Math.max(1, Math.min(requested, max + 1));
  if (order <= max) {
    await repo.query(
      `UPDATE "${tableName(repo)}" SET display_order = display_order + 1
       WHERE deleted_at IS NULL AND display_order >= $1`,
      [order],
    );
  }
  return order;
}

/** Move one row from oldOrder → newOrder; keeps 1..n without duplicates. */
export async function applyDisplayOrderUpdate(
  repo: Repository<ObjectLiteral>,
  entityId: string,
  oldOrder: number,
  newOrder: number,
): Promise<number> {
  if (oldOrder === newOrder) {
    return oldOrder;
  }

  const max = await getActiveMaxDisplayOrder(repo);
  const target = Math.max(1, Math.min(newOrder, max));
  const table = tableName(repo);

  if (target < oldOrder) {
    await repo.query(
      `UPDATE "${table}" SET display_order = display_order + 1
       WHERE deleted_at IS NULL AND display_order >= $1 AND display_order < $2 AND id != $3`,
      [target, oldOrder, entityId],
    );
  } else {
    await repo.query(
      `UPDATE "${table}" SET display_order = display_order - 1
       WHERE deleted_at IS NULL AND display_order > $1 AND display_order <= $2 AND id != $3`,
      [oldOrder, target, entityId],
    );
  }

  return target;
}

/** After soft-delete: 2→1, 3→2, etc. for rows above the removed slot. */
export async function compactDisplayOrderAfterDelete(
  repo: Repository<ObjectLiteral>,
  deletedOrder: number,
): Promise<void> {
  await repo.query(
    `UPDATE "${tableName(repo)}" SET display_order = display_order - 1
     WHERE deleted_at IS NULL AND display_order > $1`,
    [deletedOrder],
  );
}

/** Restored rows go to the end so they do not collide with live orders. */
export async function nextDisplayOrderOnRestore(
  repo: Repository<ObjectLiteral>,
): Promise<number> {
  return (await getActiveMaxDisplayOrder(repo)) + 1;
}

export async function assignDisplayOrderOnRestore<T extends ObjectLiteral>(
  repo: Repository<T>,
  entity: T & { displayOrder: number },
): Promise<T> {
  entity.displayOrder = await nextDisplayOrderOnRestore(
    repo as Repository<ObjectLiteral>,
  );
  return repo.save(entity);
}
