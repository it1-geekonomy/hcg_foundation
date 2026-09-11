import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import {
  buildPaginatedResult,
  PaginatedResult,
} from '../../common/interfaces/paginated.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

type SafeUser = Record<string, unknown>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<SafeUser> {
    await this.assertUniqueFields({
      email: dto.email,
      username: dto.username,
    });

    const entity = this.repo.create({
      fullName: dto.fullName,
      email: dto.email.toLowerCase(),
      username: dto.username.toLowerCase(),
      passwordHash: this.hashPassword(dto.password),
    });

    return this.toSafe(await this.repo.save(entity));
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<SafeUser>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repo
      .createQueryBuilder('user')
      .orderBy('user.createdAt', 'DESC');

    if (query.search) {
      qb.andWhere(
        '(user.fullName ILIKE :search OR user.email ILIKE :search OR user.username ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return buildPaginatedResult(
      data.map((user) => this.toSafe(user)),
      total,
      page,
      limit,
    );
  }

  async findOne(id: string): Promise<SafeUser> {
    return this.toSafe(await this.findEntity(id));
  }

  /** Lookup by email or username (for login). Returns entity with password hash. */
  async findByLogin(identifier: string): Promise<User | null> {
    const value = identifier.trim().toLowerCase();
    if (!value) return null;

    return this.repo.findOne({
      where: [{ email: value }, { username: value }],
    });
  }

  toSafeUser(user: User): SafeUser {
    return this.toSafe(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<SafeUser> {
    const entity = await this.findEntity(id);

    await this.assertUniqueFields(
      {
        email: dto.email,
        username: dto.username,
      },
      id,
    );

    if (dto.fullName !== undefined) entity.fullName = dto.fullName;
    if (dto.email !== undefined) entity.email = dto.email.toLowerCase();
    if (dto.username !== undefined) entity.username = dto.username.toLowerCase();
    if (dto.password) entity.passwordHash = this.hashPassword(dto.password);

    return this.toSafe(await this.repo.save(entity));
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`User ${id} not found`);
    }
  }

  private async findEntity(id: string): Promise<User> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return entity;
  }

  private toSafe(user: User): SafeUser {
    return instanceToPlain(user);
  }

  private async assertUniqueFields(
    fields: { email?: string; username?: string },
    excludeId?: string,
  ) {
    const checks: Array<{ column: keyof User; value?: string; label: string }> =
      [
        { column: 'email', value: fields.email?.toLowerCase(), label: 'email' },
        {
          column: 'username',
          value: fields.username?.toLowerCase(),
          label: 'username',
        },
      ];

    for (const check of checks) {
      if (!check.value) continue;
      const existing = await this.repo.findOne({
        where: { [check.column]: check.value } as never,
      });
      if (existing && existing.id !== excludeId) {
        throw new ConflictException(`User with this ${check.label} already exists`);
      }
    }
  }

  private hashPassword(plain: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(plain, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  verifyPassword(plain: string, stored: string): boolean {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    const next = scryptSync(plain, salt, 64);
    const prev = Buffer.from(hash, 'hex');
    if (next.length !== prev.length) return false;
    return timingSafeEqual(next, prev);
  }
}
