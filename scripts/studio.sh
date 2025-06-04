#!/bin/bash

# Load environment variables from .env
set -a
source .env
set +a

# Set DATABASE_URL based on environment
if [ "$NODE_ENV" = "production" ]; then
  export DATABASE_URL="$PROD_DATABASE_URL"
else
  export DATABASE_URL="$DEV_DATABASE_URL"
fi

# Run Prisma Studio
npx prisma studio 