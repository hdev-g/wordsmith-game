/**
 * Gets the appropriate database URL based on the environment.
 * In production: Uses Prisma Accelerate URL from PROD_DATABASE_URL
 * In development: Uses local development database URL
 */
const getDatabaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // In production, use the Prisma Accelerate URL
    return process.env.PROD_DATABASE_URL;
  }
  // In development, use the local database URL
  return process.env.DEV_DATABASE_URL;
};

export const databaseUrl = getDatabaseUrl(); 