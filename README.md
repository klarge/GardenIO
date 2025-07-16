# GardenIO 🌱

A comprehensive gardening web and mobile application that empowers users to manage their plant library, track seed planting progress, and optimize garden planning with collaborative and interactive features.

![GardenIO Dashboard](https://github.com/klarge/GardenIO/blob/main/docs/screenshots/dashboard.png?raw=true)

## ✨ Key Features

### 🏠 **Smart Dashboard**
- **Active Plantings Overview**: See all your current plantings at a glance
- **Ready to Harvest**: Track plants that are ready for harvest with visual indicators
- **Sprouting Soon**: Monitor seeds that are about to sprout
- **Quick Actions**: Add new plantings, plants, and locations directly from the dashboard
- **Status Filtering**: Filter plantings by status (Active, Ready to Harvest, Sprouting Soon)

### 🌿 **Plant Library Management**
![Plant Library](https://github.com/klarge/GardenIO/blob/main/docs/screenshots/plant-library.png?raw=true)
- **Comprehensive Plant Database**: Manage plant varieties with detailed information
- **Image Support**: Upload plant photos or use web URLs
- **Growth Tracking**: Track days to sprout and days to harvest
- **Categorization**: Organize plants by category (Vegetables, Herbs, Fruits, etc.)
- **Seasonal Planning**: Plan plantings based on optimal growing seasons

### 🏡 **Multi-Garden System**
- **Multiple Gardens**: Create and manage separate gardens for different locations
- **Garden Collaboration**: Invite other users to collaborate on your gardens
- **Role-Based Access**: Control who can view and edit your garden data
- **Garden Switching**: Easily switch between different gardens with dropdown selector

### 📍 **Location Management**
![Location Management](https://github.com/klarge/GardenIO/blob/main/docs/screenshots/locations.png?raw=true)
- **Organize by Location**: Track plantings across different areas (raised beds, containers, etc.)
- **Location Details**: Add descriptions and notes for each growing location
- **Visual Organization**: See which plants are growing where

### 📊 **Planting Tracker**
- **Detailed Planting Records**: Track planting date, quantity, location, and notes
- **Growth Status Monitoring**: Automatic status updates based on planting dates
- **Harvest Tracking**: Record harvest dates, quantities, and notes
- **Progress Visualization**: See plant progress from seed to harvest

### 🗓️ **Timeline & Calendar**
- **Calendar View**: Visual timeline of planting and harvest events
- **Planning Tool**: Plan future plantings and see optimal timing
- **Historical Data**: Review past planting and harvest activities

### 🎨 **User Experience**
- **Dark/Light Mode**: Complete theme support with user preferences
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Intuitive Interface**: Clean, modern design with easy navigation
- **Real-time Updates**: Live data synchronization across all views

### 📱 **Mobile App**
- **Android App**: Native Android application with full feature parity
- **Server Configuration**: Connect to self-hosted instances with custom server URLs
- **Offline Ready**: Works with cached data when connection is limited
- **Cross-Platform**: Seamless sync between web and mobile versions

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session-based auth
- **File Upload**: Multer for image handling
- **API**: RESTful endpoints with Zod validation

### Mobile
- **Framework**: Capacitor for cross-platform mobile development
- **Platforms**: Android (with iOS support ready)
- **Build**: Automated APK generation via GitHub Actions

### Deployment
- **Containerization**: Docker with multi-stage builds
- **CI/CD**: GitHub Actions for automated builds
- **Registry**: GitHub Container Registry (GHCR)
- **Database**: Neon Database (serverless PostgreSQL)

### Development Tools
- **Package Manager**: npm
- **Database Migrations**: Drizzle Kit
- **Code Quality**: TypeScript with strict mode
- **Hot Reload**: Vite HMR in development

## 🚀 Getting Started

### Quick Deploy (Recommended)

The easiest way to get GardenIO running is with our one-click deploy script:

```bash
git clone https://github.com/klarge/GardenIO.git
cd GardenIO
./deploy.sh
```

The script will:
- Pull the latest changes
- Try to use pre-built Docker image (falls back to building from source)
- Start all services (web app + PostgreSQL)
- Show you the access URLs

### Manual Docker Setup

#### Option 1: Using Docker Compose
```bash
git clone https://github.com/klarge/GardenIO.git
cd GardenIO
docker-compose up -d
```

#### Option 2: Build from Source
```bash
git clone https://github.com/klarge/GardenIO.git
cd GardenIO
docker-compose build --no-cache
docker-compose up -d
```

### First Time Setup

1. **Access the Application**: Open `http://localhost:5000` in your browser
2. **Create Account**: Click "Sign Up" to create your first user account
3. **Set Up Your Garden**: Create your first garden and add locations
4. **Add Plants**: Build your plant library with varieties you want to grow
5. **Start Planting**: Begin tracking your plantings and watch them grow!

### Android App Setup

1. **Download the APK**: Get the latest release from the [GitHub releases page](https://github.com/klarge/GardenIO/releases)
2. **Install**: Enable "Unknown Sources" and install the APK
3. **Configure Server**: Enter your server URL (e.g., `http://192.168.1.100:5000`)
4. **Login**: Use the same credentials as your web app

### Mobile Connection

For mobile app connectivity, use your computer's IP address:
- **Local Network**: `http://192.168.1.100:5000` (replace with your IP)
- **Remote Access**: Set up port forwarding or use a domain name

#### Option 3: Standalone Docker Image (Single container)
1. Build the standalone image:
```bash
docker build -f Dockerfile.standalone -t gardenio-standalone .
```

2. Run the standalone container:
```bash
docker run -d -p 5000:5000 -v gardenio-data:/var/lib/postgresql/data -v gardenio-uploads:/app/uploads --name gardenio gardenio-standalone
```

3. Access the application at `http://localhost:5000`

## 📖 Usage Examples

### Managing Your Plant Library
1. **Add a New Plant**: Click "Add Plant" in the library, fill in details like growing times and seasons
2. **Upload Images**: Add photos by URL or upload from your device
3. **Categorize**: Organize plants by type (Vegetables, Herbs, Fruits, etc.)

### Tracking Plantings
1. **Record Planting**: Click "Add Planting" from the dashboard
2. **Set Location**: Choose or create a new location in your garden
3. **Monitor Progress**: Watch as plants move through growth stages automatically
4. **Harvest Time**: Record harvest details when plants are ready

### Collaboration
1. **Invite Collaborators**: Use the garden settings to add other users
2. **Share Gardens**: Collaborate on planning and tracking with family or friends
3. **Role Management**: Control who can view vs. edit your garden data

### Multi-Garden Management
1. **Create Gardens**: Set up separate gardens for different locations
2. **Switch Between Gardens**: Use the garden selector dropdown
3. **Organize by Purpose**: Home garden, community plot, greenhouse, etc.

## 🔧 Local Development

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database

### Setup Steps
1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your database configuration
```

3. **Set up database**:
```bash
npm run db:push
```

4. **Start development server**:
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

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow the existing code style and patterns
4. **Test thoroughly**: Ensure all features work as expected
5. **Commit your changes**: `git commit -m 'Add some amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**: Describe your changes and why they're needed

### Development Guidelines
- Follow TypeScript best practices
- Use the existing component patterns (shadcn/ui)
- Write meaningful commit messages
- Update documentation when adding features
- Test on both web and mobile platforms

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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Community

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/klarge/GardenIO/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/klarge/GardenIO/discussions)
- 📖 **Documentation**: [Project Wiki](https://github.com/klarge/GardenIO/wiki)
- 🔧 **Development**: Check out [DEPLOYMENT.md](DEPLOYMENT.md) for detailed setup instructions

## 🌟 Star History

If you find GardenIO helpful, please consider giving it a star on GitHub! Your support helps the project grow and reach more gardeners.

---

**Happy Gardening!** 🌱✨