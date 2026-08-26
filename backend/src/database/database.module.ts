import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CMS_ENTITIES } from '../cms/cms.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbType = config.get<string>('DB_TYPE', 'mysql');
        const common = {
          host: config.get<string>('DB_HOST', 'localhost'),
          port: Number(config.get<string>('DB_PORT') || (dbType === 'mysql' ? 3306 : 5432)),
          username: config.get<string>('DB_USERNAME', 'hcg'),
          password: config.get<string>('DB_PASSWORD', 'hcg'),
          database: config.get<string>('DB_NAME', 'hcgfoundation'),
          entities: CMS_ENTITIES,
          autoLoadEntities: true,
          synchronize: config.get<string>('DB_SYNCHRONIZE', 'false') === 'true',
          logging: config.get<string>('DB_LOGGING', 'false') === 'true',
        };

        if (dbType === 'postgres') {
          return { ...common, type: 'postgres' as const };
        }

        return {
          ...common,
          type: 'mysql' as const,
          charset: 'utf8mb4',
        };
      },
    }),
  ],
})
export class DatabaseModule {}
