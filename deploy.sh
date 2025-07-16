#!/bin/bash

# GardenIO Quick Deploy Script
# This script will deploy GardenIO using Docker Compose

set -e

echo "🌱 GardenIO Quick Deploy Script"
echo "================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Pull the latest changes
echo "📦 Pulling latest changes..."
git pull origin main 2>/dev/null || echo "⚠️  Could not pull latest changes (continuing with local version)"

# Try to pull the pre-built image
echo "🐳 Attempting to pull pre-built image..."
if docker pull ghcr.io/klarge/gardenio:main 2>/dev/null; then
    echo "✅ Pre-built image pulled successfully"
else
    echo "⚠️  Pre-built image not available, will build from source"
fi

# Start the services
echo "🚀 Starting GardenIO services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ GardenIO is now running!"
    echo ""
    echo "🌐 Access your GardenIO instance at:"
    echo "   http://localhost:5000"
    echo ""
    echo "📱 For Android app connection, use:"
    echo "   http://$(hostname -I | awk '{print $1}'):5000"
    echo ""
    echo "📊 To check logs:"
    echo "   docker-compose logs -f"
    echo ""
    echo "🛑 To stop:"
    echo "   docker-compose down"
else
    echo "❌ Something went wrong. Check the logs:"
    docker-compose logs
    exit 1
fi