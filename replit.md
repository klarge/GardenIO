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

The application is configured for deployment with:
- **Build Process**: Vite builds the frontend to `dist/public`
- **Server Bundle**: esbuild bundles the Express server for production
- **Environment Variables**: Database connection via `DATABASE_URL`
- **Static Assets**: Frontend assets served by Express in production
- **Database**: Uses Neon Database for serverless PostgreSQL hosting

The build process creates a single deployable package with the bundled server serving both API endpoints and static frontend assets.

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
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```