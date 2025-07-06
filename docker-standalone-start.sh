#!/bin/bash
set -e

echo "Starting GardenIO standalone container..."

# Initialize PostgreSQL if not already done
if [ ! -s "$PGDATA/PG_VERSION" ]; then
    echo "Initializing PostgreSQL database..."
    
    # Initialize the database as postgres user
    su-exec postgres initdb --auth-local=trust --auth-host=md5
    
    # Start PostgreSQL temporarily for setup
    su-exec postgres pg_ctl start -w
    
    # Create database and user
    su-exec postgres psql --command "CREATE USER gardenio WITH SUPERUSER PASSWORD 'gardenio123';"
    su-exec postgres createdb -O gardenio gardenio
    
    # Load initial schema
    su-exec postgres psql -d gardenio -f /app/init-db.sql
    
    # Stop PostgreSQL
    su-exec postgres pg_ctl stop -w
    
    echo "PostgreSQL initialization complete."
else
    echo "PostgreSQL already initialized."
fi

# Start PostgreSQL
echo "Starting PostgreSQL..."
su-exec postgres pg_ctl start -w

# Give PostgreSQL a moment to start
sleep 3

# Run database migrations
echo "Running database migrations..."
npm run db:push || echo "Schema push completed or already up to date"

# Change ownership of uploads directory to app user
chown -R gardenio:nodejs /app/uploads 2>/dev/null || true

# Start the application as the gardenio user
echo "Starting GardenIO application..."
exec su-exec gardenio node dist/index.js