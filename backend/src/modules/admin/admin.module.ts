import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

/**
 * Internal / Admin domain
 * Tables are independent — no FK relations between entities.
 */
@Module({
  imports: [UsersModule, AuthModule],
  exports: [UsersModule, AuthModule],
})
export class AdminModule {}
