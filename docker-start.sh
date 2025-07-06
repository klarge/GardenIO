#!/bin/bash
set -e

echo "Starting GardenIO application..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
wait-for-it db:5432 --timeout=60 --strict -- echo "Database is ready!"

# Run database migrations (push schema)
echo "Running database migrations..."
npm run db:push || echo "Schema push completed or already up to date"

# Start the application
echo "Starting the application server..."
exec node dist/index.js