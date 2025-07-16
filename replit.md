# GardenTracker - Plant Management Application

## Overview

GardenTracker is a full-stack web application for managing plants and tracking garden plantings. It features a React frontend with TypeScript, shadcn/ui components, and an Express.js backend with PostgreSQL database using Drizzle ORM. The application helps users maintain a plant library, track plantings, and monitor garden progress through various views including a dashboard, timeline, and planting tracker.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful API endpoints
- **Development**: Hot reloading with Vite integration in development mode

## Key Components

### Database Schema
The application uses two main database tables:
- **Plants**: Stores plant variety information including name, description, category, growing times, and seasons
- **Plantings**: Tracks individual planting instances with location, dates, quantities, and status

### Frontend Pages
1. **Dashboard**: Overview with statistics and recent activity
2. **Plant Library**: Browse and manage plant varieties
3. **Planting Tracker**: Record and monitor individual plantings
4. **Timeline**: Calendar view of planting and harvest events

### Core Features
- Plant library management with CRUD operations
- Planting tracking with status updates
- Dashboard with garden statistics
- Timeline view for planning and monitoring
- Responsive design with mobile support

## Data Flow

1. **Client Requests**: Frontend makes API calls using TanStack Query
2. **API Processing**: Express.js routes handle requests and validate data using Zod schemas
3. **Database Operations**: Drizzle ORM executes database queries against PostgreSQL
4. **Response Handling**: Data flows back through the API to update the frontend state
5. **UI Updates**: React components re-render based on updated query cache

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives via shadcn/ui
- **Icons**: Lucide React icon library
- **Date Handling**: date-fns for date manipulation
- **Form Validation**: Zod for schema validation

### Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: Drizzle ORM for database operations
- **Session Management**: connect-pg-simple for PostgreSQL-based sessions

### Development Tools
- **Build**: Vite with React plugin
- **TypeScript**: Full type safety across the stack
- **Database Migrations**: Drizzle Kit for schema management

## Deployment Strategy

The application is configured for deployment with multiple options:

### Traditional Deployment
- **Build Process**: Vite builds the frontend to `dist/public`
- **Server Bundle**: esbuild bundles the Express server for production
- **Environment Variables**: Database connection via `DATABASE_URL`
- **Static Assets**: Frontend assets served by Express in production
- **Database**: Uses Neon Database for serverless PostgreSQL hosting

### Docker Containerization
- **Multi-container Setup**: Docker Compose with separate app and PostgreSQL containers
- **Standalone Container**: Single container with embedded PostgreSQL database
- **Auto-initialization**: Database schema and sample data automatically created
- **Health Checks**: Built-in health monitoring for production deployments
- **Database Migrations**: Automatic schema updates via Drizzle migrations
- **GitHub Actions**: Automated Docker image building and publishing to GitHub Container Registry

### Android App Packaging
- **Capacitor Integration**: Uses Capacitor to wrap the web app as a native Android app
- **APK Generation**: Automatic debug APK builds for development
- **Release Builds**: AAB bundles for Google Play Store deployment
- **GitHub Actions**: Automated Android app building with artifact uploads
- **GitHub Releases**: Automatic release creation with downloadable APKs

The build process creates multiple deployment artifacts: bundled web server, Docker images, and Android APKs.

## Changelog

```
Changelog:
- July 05, 2025. Initial setup
- July 05, 2025. Major interface restructuring:
  * Moved planting management to dashboard with clickable Active Plantings card
  * Added location management system with dedicated API and storage
  * Removed Planting Tracker from navigation menu
  * Updated button labels: "Add Planting", "Add Plant", "Add Location" (removed "New")
  * Renamed Timeline to Calendar and moved to end of navigation menu
  * Removed "Add Planting" button from top navigation bar
  * Fixed location dropdown in planting forms to use real API data
- July 05, 2025. Complete authentication and database implementation:
  * Added PostgreSQL database with full user authentication system
  * Implemented user registration and login functionality (no SSO)
  * Redesigned dashboard with filter cards: Active Plantings, Ready to Harvest, Sprouting Soon
  * Removed "Plant Varieties" section from dashboard
  * All planting information, edit/delete buttons now on cards directly (no popups)
  * Added persistent data storage with automatic sample data seeding
  * Protected all routes with authentication requirements
- July 05, 2025. GardenIO rebranding and enhanced UX:
  * Renamed app from GardenTracker to GardenIO
  * Added user menu with dark/light mode toggle and password change functionality
  * Made planting cards compact (4 per row) with detailed popup views
  * Added plant images in popup details from library
  * Fixed dark mode support across all pages including Calendar/Timeline
  * Enhanced theme system with proper contrast and readability
- July 05, 2025. Deployment infrastructure and packaging:
  * Created comprehensive Docker containerization with multi-stage builds
  * Added GitHub Actions for automated Docker image building and publishing
  * Implemented Android app packaging using Capacitor with APK generation
  * Added Docker Compose for local development with PostgreSQL
  * Created health check endpoints for production monitoring
  * Added comprehensive README with deployment instructions
  * Fixed GitHub Actions workflows for reliable Docker and Android builds
  * Updated Java version to 21 for Android Gradle Plugin compatibility
  * Created standalone Docker image with embedded PostgreSQL database
  * Added automatic database initialization and schema migration
  * Fixed image upload functionality for plant photos
- July 15, 2025. Multi-garden system and collaboration features:
  * Implemented multiple gardens system - users can create and manage separate gardens
  * Added garden collaborator system with role-based access control
  * Created harvest tracking with detailed recording of dates, quantities, and notes
  * Built garden selector component with dropdown for easy garden switching
  * Added garden settings UI for managing collaborators per garden
  * Updated all API endpoints to work with garden-specific data scoping
  * Fixed planting update functionality with proper PATCH endpoint support
  * Enhanced database schema with gardens and garden_collaborators tables
- July 16, 2025. Android app server configuration:
  * Added server configuration system for Android app to connect to custom server instances
  * Implemented server URL input with connection testing and validation
  * Created server configuration provider for seamless API URL management
  * Added Capacitor preferences integration for persistent server URL storage
  * Enhanced API client to work with both web and native app environments
  * Fixed Android build compatibility by updating to Java 21 for Gradle support
- July 16, 2025. Docker deployment improvements:
  * Updated Docker Compose to use pre-built images from GitHub Container Registry
  * Created separate docker-compose.dev.yml for local development builds
  * Simplified deployment process - users can now spin up instances with just docker-compose up
  * Added comprehensive README documentation for all deployment options
- July 16, 2025. README enhancement and documentation:
  * Added comprehensive feature showcase with detailed descriptions
  * Created visual README with screenshot placeholders for key features
  * Added usage examples and step-by-step setup instructions
  * Enhanced documentation with tech stack details and contribution guidelines
  * Created docs/screenshots directory structure for future visual documentation
  * Added sample data to demonstrate application features effectively
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```