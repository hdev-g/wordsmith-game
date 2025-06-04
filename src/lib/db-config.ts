/**
 * Gets the appropriate database URL based on the environment.
 * In production: Uses Prisma Accelerate URL from PROD_DATABASE_URL
 * In development: Uses local development database URL
 */
const getDatabaseUrl = () => {
  const url = process.env.NODE_ENV === 'production'
    ? process.env.PROD_DATABASE_URL
    : process.env.DEV_DATABASE_URL;

  // Set the DATABASE_URL that Prisma will use
  process.env.DATABASE_URL = url;
  
  return url;
};

export const databaseUrl = getDatabaseUrl(); 