import { ConflictException } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';

function tableName(repo: Repository<ObjectLiteral>): string {
  return repo.metadata.tableName;
}

/** Highest display_order among non-deleted rows (0 if none). */
export async function getActiveMaxDisplayOrder(
  repo: Repository<ObjectLiteral>,
  excludeId?: string,
): Promise<number> {
  const qb = repo
    .createQueryBuilder('entity')
    .select('MAX(entity.displayOrder)', 'max')
    .where('entity.deletedAt IS NULL');
  if (excludeId) {
    qb.andWhere('entity.id != :excludeId', { excludeId });
  }
  const row = await qb.getRawOne<{ max: string | null }>();
  return Number(row?.max ?? 0);
}

async function isDisplayOrderTaken(
  repo: Repository<ObjectLiteral>,
  order: number,
  excludeId?: string,
): Promise<boolean> {
  const qb = repo
    .createQueryBuilder('entity')
    .where('entity.deletedAt IS NULL')
    .andWhere('entity.displayOrder = :order', { order });
  if (excludeId) {
    qb.andWhere('entity.id != :excludeId', { excludeId });
  }
  const count = await qb.getCount();
  return count > 0;
}

function duplicateOrderError(order: number): ConflictException {
  return new ConflictException(
    `Display order ${order} is already in use. Choose a different display order.`,
  );
}

/**
 * Pick order for a new row.
 * Omit `requested` to append at the end (max + 1).
 * If `requested` is already used → 409 Conflict.
 */
export async function prepareInsertDisplayOrder(
  repo: Repository<ObjectLiteral>,
  requested?: number,
): Promise<number> {
  const max = await getActiveMaxDisplayOrder(repo);
  if (requested === undefined || requested === null) {
    return max + 1;
  }

  const order = Math.max(1, requested);
  if (await isDisplayOrderTaken(repo, order)) {
    throw duplicateOrderError(order);
  }
  return order;
}

/**
 * Change display order on update.
 * Same order as now → no-op.
 * Target already used by another row → 409 Conflict.
 */
export async function applyDisplayOrderUpdate(
  repo: Repository<ObjectLiteral>,
  entityId: string,
  oldOrder: number,
  newOrder: number,
): Promise<number> {
  if (oldOrder === newOrder) {
    return oldOrder;
  }

  const target = Math.max(1, newOrder);
  if (await isDisplayOrderTaken(repo, target, entityId)) {
    throw duplicateOrderError(target);
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

/**
 * Put a restored row back at its original display_order.
 * Soft-deleted rows keep their old order; after compact the live list is 1..n.
 * Re-insert at that original slot (clamped to max+1) and shift siblings.
 */
export async function restoreDisplayOrderAtOriginal(
  repo: Repository<ObjectLiteral>,
  entityId: string,
  originalOrder: number,
): Promise<number> {
  const maxOthers = await getActiveMaxDisplayOrder(repo, entityId);
  const target = Math.max(1, Math.min(originalOrder || 1, maxOthers + 1));

  await repo.query(
    `UPDATE "${tableName(repo)}" SET display_order = display_order + 1
     WHERE deleted_at IS NULL AND display_order >= $1 AND id != $2`,
    [target, entityId],
  );

  return target;
}

export async function assignDisplayOrderOnRestore<T extends ObjectLiteral>(
  repo: Repository<T>,
  entity: T & { id: string; displayOrder: number },
): Promise<T> {
  const originalOrder = entity.displayOrder ?? 1;
  entity.displayOrder = await restoreDisplayOrderAtOriginal(
    repo as Repository<ObjectLiteral>,
    entity.id,
    originalOrder,
  );
  return repo.save(entity);
}
