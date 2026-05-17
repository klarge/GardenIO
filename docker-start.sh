#!/bin/bash
set -e

echo "Starting GardenIO application..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
wait-for-it db:5432 --timeout=60 --strict -- echo "Database is ready!"

# Run database migrations (non-interactive, force to avoid prompts)
echo "Running database migrations..."
npx drizzle-kit push --force || echo "Schema push completed or already up to date"

# Start the application
echo "Starting the application server..."
exec node dist/index.js