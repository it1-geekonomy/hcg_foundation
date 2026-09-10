export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '6060', 10),
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    name: process.env.DB_NAME ?? 'hcg_db',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
  },
  ai: {
    serviceUrl: process.env.AI_SERVICE_URL ?? 'http://localhost:8001',
    internalKey: process.env.AI_SERVICE_INTERNAL_KEY ?? '',
  },
  auth: {
    jwtSecret:
      process.env.AUTH_JWT_SECRET ?? 'hcg-dev-secret-change-me',
    jwtExpiresInSeconds: parseInt(
      process.env.AUTH_JWT_EXPIRES_IN_SECONDS ?? String(60 * 60 * 24 * 7),
      10,
    ),
  },
  r2: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
    bucketName: process.env.R2_BUCKET_NAME ?? '',
    endpoint: process.env.R2_ENDPOINT ?? '',
    publicUrl: process.env.R2_PUBLIC_URL ?? '',
    region: process.env.R2_REGION ?? 'auto',
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID ?? '',
    keySecret: process.env.RAZORPAY_KEY_SECRET ?? '',
  },
});
