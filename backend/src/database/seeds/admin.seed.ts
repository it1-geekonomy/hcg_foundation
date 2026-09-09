import { randomBytes, scryptSync } from 'crypto';
import AppDataSource from '../data-source';
import { User } from '../../modules/users/entities/user.entity';

/**
 * Super-admin seeder — idempotent.
 * Run: pnpm seed
 *
 * Env (optional overrides):
 *   SEED_ADMIN_FULL_NAME
 *   SEED_ADMIN_EMAIL
 *   SEED_ADMIN_USERNAME
 *   SEED_ADMIN_PASSWORD
 *   SEED_ADMIN_SLUG
 */
async function seed() {
  const fullName = process.env.SEED_ADMIN_FULL_NAME ?? 'HCG Admin';
  const email = (process.env.SEED_ADMIN_EMAIL ?? 'admin@hcgfoundation.org')
    .trim()
    .toLowerCase();
  const username = (process.env.SEED_ADMIN_USERNAME ?? 'admin')
    .trim()
    .toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@12345';
  const slug =
    process.env.SEED_ADMIN_SLUG?.trim() ||
    `${username.replace(/[^a-z0-9]+/g, '-')}-seed`;

  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(User);

  const existing = await repo.findOne({
    where: [{ email }, { username }],
  });

  if (existing) {
    console.log(
      `[seed] Super-admin already exists (email=${existing.email}, username=${existing.username}). Skipping.`,
    );
    await AppDataSource.destroy();
    return;
  }

  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  const passwordHash = `${salt}:${hash}`;

  const user = repo.create({
    fullName,
    email,
    username,
    slug,
    passwordHash,
  });

  const saved = await repo.save(user);
  console.log('[seed] Super-admin created:');
  console.log(`  id:       ${saved.id}`);
  console.log(`  fullName: ${saved.fullName}`);
  console.log(`  email:    ${saved.email}`);
  console.log(`  username: ${saved.username}`);
  console.log(`  password: ${password}`);
  console.log('[seed] Change the password after first login.');

  await AppDataSource.destroy();
}

seed().catch(async (err) => {
  console.error('[seed] Failed:', err);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
