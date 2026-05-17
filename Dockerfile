# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code
COPY client ./client
COPY server ./server
COPY shared ./shared
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY tsconfig.json ./
COPY components.json ./
COPY drizzle.config.ts ./

# Build both frontend and backend
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies including drizzle-kit for migrations
COPY package*.json ./
RUN npm ci --only=production && \
    npm install drizzle-kit && \
    npm cache clean --force

# Copy built files
COPY --from=build /app/dist ./dist

# Copy shared files and config
COPY shared ./shared
COPY drizzle.config.ts ./

# Install bash (not included in Alpine by default)
RUN apk add --no-cache bash

# Copy startup script
COPY docker-start.sh ./
RUN chmod +x docker-start.sh

# Create uploads directory
RUN mkdir -p uploads

# Install wait-for-it script for database readiness
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /usr/local/bin/wait-for-it
RUN chmod +x /usr/local/bin/wait-for-it

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S gardenio -u 1001

# Change ownership of the app directory
RUN chown -R gardenio:nodejs /app
USER gardenio

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the application with the startup script
CMD ["./docker-start.sh"]