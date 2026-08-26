import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { CMS_ENTITIES } from '../cms/cms.module';

dotenv.config();

const dbType = (process.env.DB_TYPE || 'mysql') as 'mysql' | 'postgres';

const AppDataSource = new DataSource({
  type: dbType,
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || (dbType === 'mysql' ? 3306 : 5432),
  username: process.env.DB_USERNAME || 'hcg',
  password: process.env.DB_PASSWORD || 'hcg',
  database: process.env.DB_NAME || 'hcgfoundation',
  entities: CMS_ENTITIES,
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});

export default AppDataSource;
