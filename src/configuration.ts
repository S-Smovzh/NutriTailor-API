interface Config {
  openAiUrl: string;
  openAiKey: string;
  accessKeyId: string;
  secretAccessKey: string;
  outboxEmail: string;
  sourceEmail: string;
  frontendBaseUrl: string;
  backendBaseUrl: string;
  awsRegion: string;
  awsProfile?: string;
  port: number;
  mongodbUri: string;
  mongodbName: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtExpirationTime: string;
  jwtExpirationTimeSeconds: number;
  refreshJwtExpirationTime: string;
  refreshJwtExpirationTimeSeconds: number;
  verificationTokenExpirationTime: string;
  verificationTokenExpirationTimeSeconds: number;
}

function loadConfig(): Config {
  const config: Config = {
    openAiUrl: process.env.OPEN_AI_URL ?? '',
    openAiKey: process.env.OPEN_AI_KEY ?? '',
    outboxEmail: process.env.OUTBOX_EMAIL ?? '',
    sourceEmail: process.env.SOURCE_EMAIL ?? '',
    frontendBaseUrl: process.env.FRONTEND_BASE_URL ?? '',
    backendBaseUrl: process.env.BACKEND_BASE_URL ?? '',
    awsProfile: process.env.AWS_PROFILE ?? '',
    awsRegion: process.env.AWS_REGION ?? '',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
    port: Number(process.env.PORT ?? 5000),
    mongodbUri: process.env.MONGODB_URI ?? '',
    mongodbName: process.env.MONGODB_NAME ?? '',
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtExpirationTime: process.env.JWT_EXPIRATION_TIME,
    jwtExpirationTimeSeconds: +process.env.JWT_EXPIRATION_TIME_SECONDS,
    refreshJwtExpirationTime: process.env.REFRESH_JWT_EXPIRATION_TIME,
    refreshJwtExpirationTimeSeconds: +process.env.REFRESH_JWT_EXPIRATION_TIME_SECONDS,
    verificationTokenExpirationTime: process.env.VERIFICATION_TOKEN_EXPIRATION_TIME,
    verificationTokenExpirationTimeSeconds: +process.env.VERIFICATION_TOKEN_EXPIRATION_TIME_SECONDS,
  };

  console.log(JSON.stringify(config, undefined, 2));

  return config;
}

export { loadConfig };
export type { Config };
