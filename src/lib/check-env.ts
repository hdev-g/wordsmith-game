import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local specifically
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

console.log('Environment variables from .env.local:');
console.log('POSTGRES_PRISMA_URL:', process.env.POSTGRES_PRISMA_URL);
console.log('POSTGRES_URL_NON_POOLING:', process.env.POSTGRES_URL_NON_POOLING);
console.log('DATABASE_URL:', process.env.DATABASE_URL); 