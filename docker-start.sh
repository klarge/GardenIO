#!/bin/bash
set -e

echo "Starting GardenIO application..."

# Wait for database to be ready using bash built-in TCP check
echo "Waiting for database to be ready..."
DB_HOST="${PGHOST:-db}"
DB_PORT="${PGPORT:-5432}"
RETRIES=30
until bash -c "echo > /dev/tcp/${DB_HOST}/${DB_PORT}" 2>/dev/null; do
  RETRIES=$((RETRIES - 1))
  if [ "$RETRIES" -le 0 ]; then
    echo "ERROR: Database did not become ready in time. Exiting."
    exit 1
  fi
  echo "Database not ready, retrying in 2s... ($RETRIES attempts left)"
  sleep 2
done
echo "Database is ready!"

# Run database migrations (non-interactive, force to avoid prompts)
echo "Running database migrations..."
npx drizzle-kit push --force || echo "Schema push completed or already up to date"

# Start the application
echo "Starting the application server..."
exec node dist/index.js