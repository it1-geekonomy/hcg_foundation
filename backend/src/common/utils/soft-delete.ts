import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  ObjectLiteral,
  QueryFailedError,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';

type SoftDeletable = ObjectLiteral & { id: string; deletedAt?: Date | null };

export function applyDeletedFilter<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  includeDeleted?: boolean,
): SelectQueryBuilder<T> {
  if (includeDeleted) {
    qb.withDeleted();
  }
  return qb;
}

export async function restoreSoftDeleted<T extends SoftDeletable>(
  repo: Repository<T>,
  id: string,
  label: string,
): Promise<T> {
  const entity = await repo.findOne({
    where: { id } as never,
    withDeleted: true,
  });

  if (!entity) {
    throw new NotFoundException(
      `${label} not found for id "${id}". Check the id and try again.`,
    );
  }

  if (!entity.deletedAt) {
    return entity;
  }

  try {
    return await repo.recover(entity);
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new ConflictException(
        `Cannot restore this ${label.toLowerCase()} because another active record already uses the same unique value.`,
      );
    }
    throw err;
  }
}

function isUniqueViolation(err: unknown): boolean {
  return (
    err instanceof QueryFailedError &&
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: string }).code === '23505'
  );
}
