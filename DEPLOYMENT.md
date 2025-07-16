# GardenIO Deployment Guide

## Quick Docker Deployment

The easiest way to deploy GardenIO is using Docker Compose with the pre-built image.

### Prerequisites
- Docker and Docker Compose installed on your system

### Method 1: One-Click Deploy (Recommended)
```bash
git clone https://github.com/klarge/GardenIO.git
cd GardenIO
./deploy.sh
```

The deploy script will:
- Pull the latest changes
- Try to use pre-built image (falls back to building from source)
- Start all services
- Show you the access URLs

### Method 2: Manual Deploy
```bash
git clone https://github.com/klarge/GardenIO.git
cd GardenIO
docker-compose up -d
```

### Access Your Instance
- Open your browser and go to `http://localhost:5000`
- Create your first user account by clicking "Sign Up"

### 3. Android App Connection
If you want to use the Android app with your local instance:
1. Find your local IP address (e.g., `192.168.1.100`)
2. Download the GardenIO Android app
3. When prompted, enter your server URL: `http://192.168.1.100:5000`
4. The app will test the connection and save your settings

## What Gets Deployed

The Docker Compose setup includes:
- **GardenIO App**: Web application with API backend
- **PostgreSQL Database**: Persistent data storage
- **Sample Data**: Pre-loaded with example plants and locations
- **File Storage**: Persistent uploads directory for plant images

## Configuration

### Environment Variables
You can customize the deployment by setting these environment variables:

```bash
# Optional: Set a custom session secret
export SESSION_SECRET="your-super-secret-key-here"

# Then run
docker-compose up -d
```

### Port Configuration
To run on a different port, modify the `docker-compose.yml` file:
```yaml
services:
  gardenio:
    ports:
      - "8080:5000"  # Change 8080 to your preferred port
```

## Updating

To update to the latest version:
```bash
docker-compose pull
docker-compose up -d
```

## Backup

Your data is stored in Docker volumes. To backup:
```bash
# Backup database
docker-compose exec db pg_dump -U gardenio gardenio > backup.sql

# Backup uploaded files
docker cp $(docker-compose ps -q gardenio):/app/uploads ./uploads-backup
```

## Troubleshooting

### App won't start
```bash
# Check logs
docker-compose logs gardenio

# Check database
docker-compose logs db
```

### Reset everything
```bash
# Stop and remove containers and volumes
docker-compose down -v

# Start fresh
docker-compose up -d
```

## Production Considerations

For production deployment:
1. Set a strong `SESSION_SECRET` environment variable
2. Configure proper SSL/TLS termination (nginx, Traefik, etc.)
3. Set up regular database backups
4. Monitor container logs and health
5. Consider using external PostgreSQL for better reliability

## Alternative Deployment Methods

See the main [README.md](README.md) for other deployment options including:
- Local development setup
- Standalone Docker container
- Building from source