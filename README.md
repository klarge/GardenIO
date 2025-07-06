# GardenIO 🌱

A comprehensive gardening web application with user authentication, plant library management, location-based planting tracking, and an intuitive dashboard with filter-based planting management.

## Features

- **User Authentication**: Secure signup/signin with PostgreSQL persistence
- **Plant Library**: Manage plant varieties with image upload support
- **Planting Tracker**: Record and monitor plantings with automatic calculations
- **Dashboard**: Filter plantings by status (Active, Ready to Harvest, Sprouting Soon)
- **Calendar View**: Timeline of planting and harvest events
- **Location Management**: Organize plantings by location
- **Dark/Light Mode**: Complete theme support with user preferences
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js, PostgreSQL, Drizzle ORM
- **Authentication**: Passport.js with session-based auth
- **File Upload**: Multer for image handling
- **Build Tools**: Vite, esbuild

## Quick Start

### Using Docker (Recommended)

#### Option 1: Docker Compose (Multi-container)
1. Clone the repository:
```bash
git clone https://github.com/klarge/GardenIO.git
cd GardenIO
```

2. Run with Docker Compose:
```bash
docker-compose up -d
```

3. Access the application at `http://localhost:5000`

#### Option 2: Standalone Docker Image (Single container)
1. Build the standalone image:
```bash
docker build -f Dockerfile.standalone -t gardenio-standalone .
```

2. Run the standalone container:
```bash
docker run -d -p 5000:5000 -v gardenio-data:/var/lib/postgresql/data -v gardenio-uploads:/app/uploads --name gardenio gardenio-standalone
```

3. Access the application at `http://localhost:5000`

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database configuration
```

3. Set up the database:
```bash
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

5. Access the application at `http://localhost:5000`

## Deployment

### Docker

The application includes multiple Docker deployment options:

#### Multi-container Setup (Docker Compose)
- **Separate containers**: Application and PostgreSQL in separate containers
- **Health checks**: Database health monitoring with automatic waiting
- **Persistent storage**: Data persists across container restarts
- **Easy scaling**: Can easily scale components independently

#### Standalone Container
- **Single container**: Application and PostgreSQL in one container
- **Self-contained**: No external dependencies required
- **Embedded database**: PostgreSQL runs inside the application container
- **Simplified deployment**: One image contains everything needed

#### GitHub Actions Integration
- **Automated builds**: Images automatically built and pushed to GitHub Container Registry
- **AMD64 architecture**: Optimized builds for Linux AMD64 systems
- **Production ready**: Health checks and proper startup sequences

**Manual deployment examples:**
```bash
# Multi-container with Docker Compose
docker-compose up -d

# Standalone container
docker build -f Dockerfile.standalone -t gardenio-standalone .
docker run -d -p 5000:5000 --name gardenio gardenio-standalone

# Using external database
docker run -p 5000:5000 \
  -e DATABASE_URL="your-database-url" \
  -e SESSION_SECRET="your-session-secret" \
  gardenio
```

### Android App

The project includes GitHub Actions for building Android apps using Capacitor:

- **APK Generation**: Debug APKs can be built manually or on releases
- **Java 17 Compatibility**: Configured for modern Android builds
- **Manual Triggers**: Build APKs on-demand via GitHub Actions workflow_dispatch
- **Automatic Releases**: GitHub releases are created with downloadable APKs for tagged versions

To build locally:
```bash
# Install Capacitor
npm install -g @capacitor/cli
npm install @capacitor/core @capacitor/android

# Build the web app
npm run build

# Initialize and build Android
npx cap init GardenIO io.garden.app --web-dir=dist/public
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/gardenio

# Session
SESSION_SECRET=your-super-secret-session-key

# Development
NODE_ENV=development
```

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user
- `POST /api/change-password` - Change password

### Plants
- `GET /api/plants` - List all plants
- `POST /api/plants` - Create new plant
- `PATCH /api/plants/:id` - Update plant
- `DELETE /api/plants/:id` - Delete plant

### Locations
- `GET /api/locations` - List all locations
- `POST /api/locations` - Create new location
- `PATCH /api/locations/:id` - Update location
- `DELETE /api/locations/:id` - Delete location

### Plantings
- `GET /api/plantings` - List user's plantings
- `POST /api/plantings` - Create new planting
- `PATCH /api/plantings/:id` - Update planting
- `DELETE /api/plantings/:id` - Delete planting

### Utilities
- `GET /api/stats` - Dashboard statistics
- `POST /api/upload-image` - Upload plant images
- `GET /api/health` - Health check

## Database Schema

The application uses PostgreSQL with the following main tables:

- **users**: User authentication and profiles
- **plants**: Plant variety library with images
- **locations**: Garden locations and areas
- **plantings**: Individual planting records with dates and quantities

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## GitHub Actions

### Docker Workflow
- Triggers on pushes to `main` and `develop` branches
- Builds multi-platform Docker images
- Pushes to GitHub Container Registry
- Supports semantic versioning with tags

### Android Workflow
- Builds debug APKs for all pushes
- Creates release AABs for tagged versions
- Automatically uploads artifacts
- Creates GitHub releases with downloadable apps

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on GitHub or contact the maintainers.

---

Built with ❤️ for gardeners everywhere 🌿