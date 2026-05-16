# GardenIO 🌱

A comprehensive gardening web and mobile application for managing your plant library, tracking plantings, and planning your garden season with collaborative multi-garden support.

![GardenIO Dashboard](docs/screenshots/dashboard.svg)

## ✨ Key Features

### 🏠 **Smart Dashboard**
- **Filter Cards**: Instantly switch between Active Plantings, Ready to Harvest, and Sprouting Soon views
- **Compact Planting Cards**: See up to 4 plantings per row — each showing plant name, cultivar, location, planted date, quantity, and status badge
- **Trait Badges**: Heirloom and Perennial badges appear directly on dashboard cards
- **Quick Actions**: Add new plantings straight from the dashboard

### 🌿 **Plant Library Management**
![Plant Library](docs/screenshots/plant-library.svg)
- **Rich Plant Profiles**: Name, cultivar, description, category, season, days to sprout, days to maturity
- **Plant Traits**: Mark plants as Perennial or Heirloom; set sowing method (start inside / direct sow)
- **Five Categories**: Vegetable, Herb, Fruit, Flower, and Tree — each with distinct color coding
- **Growing Conditions**: Sun requirement, seed depth, spacing, support and pinching needs, cold hardiness
- **Image Support**: Upload photos or link from a URL
- **Vendor Associations**: Link plants to one or more suppliers from your vendor list

### 🏪 **Vendor Tracking**
![Vendors](docs/screenshots/vendors.svg)
- **Supplier Directory**: Track every seed and plant supplier you use
- **Multi-Category Tags**: Each vendor can be tagged with multiple plant categories (Seeds, Vegetables, Herbs, Fruits, Flowers, Trees, Specialty) — selected via checkboxes, displayed as colour-coded badges
- **Contact Details**: Website URL and physical address per vendor
- **Fulfilment Options**: Track whether a vendor ships orders and/or offers local pickup
- **Notes**: Free-text notes for ordering tips, discount codes, etc.
- **Plant Association**: See which of your plants came from each vendor

### 🏡 **Multi-Garden System**
- **Multiple Gardens**: Create and manage separate gardens (home, allotment, greenhouse, etc.)
- **Garden Collaboration**: Invite other users to collaborate on your gardens
- **Role-Based Access**: Control who can view and edit each garden
- **Easy Switching**: Garden selector dropdown in the navigation bar

### 📍 **Location Management**
- **Organised by Area**: Track plantings across raised beds, containers, borders, and more
- **Descriptions**: Add notes for each growing location
- **Linked to Plantings**: Every planting record references a specific location

### 🗓️ **Interactive Garden Calendar**
![Garden Calendar](docs/screenshots/calendar.svg)
- **Three Event Types**: Planted (green), Sprouting (amber), and Maturity (red) milestones shown on a monthly grid
- **Clickable Events**: Click any event chip on the calendar — or any row in the Upcoming Events list — to open a full planting detail popup showing status, dates, location, quantity, and notes
- **Month Navigation**: Browse past and future months with previous / next / today controls
- **Upcoming Events Panel**: Sorted list of events in the next 30 days with relative time labels

### 🎨 **User Experience**
- **Dark / Light Mode**: Full theme support with a toggle in the user menu
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Change Password**: Manage your account directly from the user menu
- **Real-time Updates**: TanStack Query keeps all views in sync

### 📱 **Mobile App**
- **Android App**: Native Android application via Capacitor with full feature parity
- **Server Configuration**: Connect to self-hosted instances with a custom server URL
- **Cross-Platform Sync**: Same account works on web and mobile

---

## 🛠️ Tech Stack

### Frontend
| Tool | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Tailwind CSS + shadcn/ui | Styling and components |
| TanStack Query | Server state and caching |
| Wouter | Client-side routing |
| React Hook Form + Zod | Forms and validation |
| Lucide React | Icons |
| Vite | Build tool |

### Backend
| Tool | Purpose |
|---|---|
| Node.js + Express.js | API server |
| PostgreSQL + Drizzle ORM | Database and queries |
| Passport.js | Session-based authentication |
| Multer | Image uploads |
| Zod | Request validation |

### Mobile
- **Capacitor** — wraps the web app as a native Android app
- Automated APK builds via GitHub Actions

### Deployment
- **Docker** — multi-stage builds and Docker Compose
- **GitHub Actions** — CI/CD for Docker images and Android APKs
- **GitHub Container Registry** — pre-built images
- **Neon Database** — serverless PostgreSQL hosting

---

## 🚀 Getting Started

### Quick Deploy (Recommended)

```bash
git clone https://github.com/klarge/GardenIO.git
cd GardenIO
./deploy.sh
```

The script pulls the latest changes, tries the pre-built Docker image (falls back to building from source), starts all services, and prints the access URL.

### Manual Docker Setup

#### Option 1: Docker Compose (pre-built image)
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

#### Option 3: Standalone Container (app + embedded PostgreSQL)
```bash
docker build -f Dockerfile.standalone -t gardenio-standalone .
docker run -d -p 5000:5000 \
  -v gardenio-data:/var/lib/postgresql/data \
  -v gardenio-uploads:/app/uploads \
  --name gardenio gardenio-standalone
```

Access the app at **http://localhost:5000**.

### First Time Setup

1. Open `http://localhost:5000` and click **Sign Up**
2. Create your first **Garden** and add **Locations** (raised beds, containers, etc.)
3. Build your **Plant Library** with the varieties you grow
4. Add **Vendors** to track your seed and plant suppliers
5. Start recording **Plantings** and watch the calendar fill up

### Android App Setup

1. Download the latest APK from the [GitHub Releases page](https://github.com/klarge/GardenIO/releases)
2. Enable "Install from Unknown Sources" and install the APK
3. On first launch, enter your server URL (e.g. `http://192.168.1.100:5000`)
4. Log in with the same credentials as your web account

---

## 📖 Usage Examples

### Managing Plants
1. Go to **Plant Library → Add Plant**
2. Fill in name, cultivar, category, days to sprout, and days to maturity
3. Tick **Perennial** or **Heirloom** if applicable; choose sowing method
4. Associate one or more **Vendors** from your supplier list

### Managing Vendors
1. Go to **Vendors → Add Vendor**
2. Enter name, website, and address
3. Tick all applicable **Plant Categories** (checkboxes — pick as many as apply)
4. Mark whether the vendor ships and/or offers local pickup

### Tracking Plantings
1. From the **Dashboard**, click **Add Planting**
2. Select a plant, location, date, and quantity
3. The dashboard auto-sorts plantings by status; the calendar automatically plots Planted, Sprouting, and Maturity events
4. Click any calendar event to view the full planting detail

### Collaborating on a Garden
1. Open **Garden Settings** from the garden selector
2. Enter a username to invite as a collaborator
3. Collaborators can view and add plantings in the shared garden

---

## 🔧 Local Development

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Set DATABASE_URL and SESSION_SECRET in .env

# 3. Push schema to database
npm run db:push

# 4. Start dev server (Express + Vite HMR)
npm run dev
```

App runs at **http://localhost:5000**.

---

## 🌐 API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/register` | Create account |
| POST | `/api/login` | Sign in |
| POST | `/api/logout` | Sign out |
| GET | `/api/user` | Current user |
| POST | `/api/change-password` | Change password |

### Plants
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/plants` | List all plants |
| POST | `/api/plants` | Create plant |
| PATCH | `/api/plants/:id` | Update plant |
| DELETE | `/api/plants/:id` | Delete plant |
| GET | `/api/plants/:id/vendors` | Plant's vendors |
| PUT | `/api/plants/:id/vendors` | Set plant's vendors |

### Vendors
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/vendors` | List all vendors |
| POST | `/api/vendors` | Create vendor |
| PUT | `/api/vendors/:id` | Update vendor |
| DELETE | `/api/vendors/:id` | Delete vendor |

### Plantings
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/plantings` | List plantings (by garden) |
| POST | `/api/plantings` | Create planting |
| PATCH | `/api/plantings/:id` | Update planting |
| DELETE | `/api/plantings/:id` | Delete planting |

### Gardens & Locations
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/gardens` | List user's gardens |
| POST | `/api/gardens` | Create garden |
| GET | `/api/locations` | List locations |
| POST | `/api/locations` | Create location |
| PATCH | `/api/locations/:id` | Update location |
| DELETE | `/api/locations/:id` | Delete location |

### Utilities
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/stats` | Dashboard statistics |
| POST | `/api/upload-image` | Upload plant image |
| GET | `/api/health` | Health check |

---

## 🗃️ Database Schema

| Table | Purpose |
|---|---|
| `users` | Authentication and profiles |
| `gardens` | Garden instances per user |
| `garden_collaborators` | Multi-user garden access |
| `plants` | Plant variety library |
| `vendors` | Seed and plant suppliers |
| `plant_vendors` | Plant ↔ vendor associations |
| `locations` | Named growing areas per garden |
| `plantings` | Individual planting records |

---

## 🚢 Deployment

### Docker

```bash
# Multi-container (app + separate PostgreSQL)
docker-compose up -d

# Standalone (everything in one container)
docker build -f Dockerfile.standalone -t gardenio-standalone .
docker run -d -p 5000:5000 --name gardenio gardenio-standalone

# External database
docker run -p 5000:5000 \
  -e DATABASE_URL="your-database-url" \
  -e SESSION_SECRET="your-session-secret" \
  gardenio
```

### Android App (local build)

```bash
npm install -g @capacitor/cli
npm run build
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug
```

---

## ⚙️ Environment Variables

```env
DATABASE_URL=postgresql://username:password@localhost:5432/gardenio
SESSION_SECRET=your-super-secret-session-key
NODE_ENV=development
```

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

## 🆘 Support

No guarantees, but feel free to open an issue.

**Happy Gardening!** 🌱
