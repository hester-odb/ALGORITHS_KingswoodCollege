# ⚡ EcoSpark Hub - Internal Operations & Inventory Portal
### Built for EcoSpark Innovations • Classroom & Local Office Operations Hub

---

## 🌟 1. Project Overview & Background
**EcoSpark Innovations** is a fast-growing startup creating fun, smart tools for modern classrooms and local offices (such as digitized smart pens, solar mini-projectors, environmental classroom sensor hubs, and modular robotics kits).

As the startup grew, two operational problems emerged:
1. **Equipment & Supplies Chaos:** Projectors, testing kits, teacher laptops, and lab tools moved between classrooms and workshops without records of who borrowed what, when items were due back, or their condition.
2. **Scattered Project Documents:** Lesson manuals, hardware schematics, PCB circuits, 3D CAD models, and onboarding guides were scattered across different drives and chat threads.

**EcoSpark Hub** solves this by providing a unified internal portal where staff can:
- **Track Supplies & Gear:** Visually see what items are Available or In Use, filter by room/category, check items out to team members with return dates, and log returns with condition checks.
- **Organize Files & Documents:** Navigate structured company folders (Classroom Kits, Hardware Schematics, Design Notes, Policies, Firmware), filter by tags, preview content in the browser, and publish new project files.
- **Maintain High Usability:** Benefit from instant real-time search, active staff switcher, KPI metric cards, and a chronological audit log feed.

---

## 📂 2. Directory Architecture (Separate Frontend & Backend)

The project strictly adheres to the directive of separate directories for frontend and backend, with complete separation of concerns:

```
ALGORITHS_Schoolname_TopicNo/
├── EXECUTION_PLAN.md               # Detailed technical execution plan & architecture
├── README.md                       # Comprehensive guide and operational instructions
│
├── backend/                        # Independent Backend REST Service
│   ├── package.json                # Project manifest (Node.js engine specifications)
│   ├── server.js                   # Zero-dependency native Node.js HTTP REST API server
│   ├── server.py                   # Alternative zero-dependency Python 3 HTTP REST server
│   ├── src/
│   │   ├── config/
│   │   │   └── AppConfig.js        # Encapsulated application configuration singleton
│   │   ├── models/                 # Domain Entities enforcing invariants & private state
│   │   │   ├── BaseEntity.js       # Base entity with UUID, timestamps & protected methods
│   │   │   ├── InventoryItem.js    # Supply item model with checkout/return business rules
│   │   │   ├── DocumentItem.js     # Document model with tag protection & folder association
│   │   │   ├── Folder.js           # Folder hierarchy model
│   │   │   └── AuditLog.js         # Immutable audit event model
│   │   ├── repositories/           # Data Access Layer (persistence & querying)
│   │   │   ├── BaseRepository.js   # Generic CRUD, JSON read/write, in-memory cache
│   │   │   ├── InventoryRepository.js # Item queries (by status, category, location, search)
│   │   │   ├── DocumentRepository.js  # Document queries (by folder, tags, search)
│   │   │   ├── FolderRepository.js    # Folder tree queries
│   │   │   └── AuditRepository.js     # Activity timeline queries
│   │   ├── services/               # Business Logic Layer (orchestrates workflows & audit logs)
│   │   │   ├── InventoryService.js # Checkout, return, item creation, inventory statistics
│   │   │   ├── DocumentService.js  # Folder management, document publishing, tag queries
│   │   │   └── AuditService.js     # Immutable event logging
│   │   ├── controllers/            # HTTP Request Handlers
│   │   │   ├── InventoryController.js
│   │   │   ├── DocumentController.js
│   │   │   └── StatsController.js
│   │   ├── routes/                 # Routing & Middleware
│   │   │   ├── Router.js           # REST regex URL router with parameter extraction
│   │   │   └── Middleware.js       # CORS headers, JSON parser, error responses
│   │   └── data/                   # Persistent seed data stores
│   │       ├── inventory.json      # Equipment records (12 seed items)
│   │       ├── documents.json      # Project files & notes (8 seed files)
│   │       ├── folders.json        # Folder categories (5 company folders)
│   │       └── audit_logs.json     # Historical checkout records
│   └── tests/
│       └── backend.test.js         # Automated domain logic test suite
│
└── frontend/                       # Independent Client Application
    ├── index.html                  # Accessible, responsive HTML5 single-page application
    ├── assets/
    │   ├── favicon.svg             # EcoSpark brand spark icon
    │   └── gear/                   # 13 Dedicated offline vector equipment illustrations (SVG)
    ├── css/
    │   ├── variables.css           # EcoSpark design tokens (Emeralds, Spark Cyan, Amber)
    │   ├── base.css                # CSS reset, typography, header, footer, navigation tabs
    │   ├── components.css          # Cards, badges, modals, toolbars, buttons, timeline
    │   └── utilities.css           # Grid, flexbox helpers, and responsive breakpoints
    └── js/
        ├── app.js                  # Dependency injection container & application bootstrap
        ├── models/                 # Frontend View Models with presentation logic
        │   ├── ItemViewModel.js    # Item presentation logic, badge generation, borrower info
        │   └── DocumentViewModel.js# File size/type formatting, preview mapping
        ├── services/               # API & Resilient Storage Layer
        │   ├── LocalStorageAdapter.js # Offline-first persistent fallback engine
        │   ├── ApiClient.js        # HTTP client with health check & fallback detection
        │   ├── InventoryService.js # Frontend Supply & Gear service
        │   └── DocumentService.js  # Frontend Document & Folder service
        ├── state/
        │   └── Store.js            # Encapsulated observable state store (Pub/Sub pattern)
        ├── components/             # Self-contained UI components
        │   ├── Toast.js            # Encapsulated floating notification banner
        │   ├── Navbar.js           # Navigation tabs, branding, and team member switcher
        │   ├── QuickStats.js       # Live KPI summary cards (Total, Available, In Use, Docs)
        │   ├── InventoryView.js    # Filter pills, search bar, item cards, checkout/return
        │   ├── DocumentExplorer.js # Folder sidebar, breadcrumbs, tag pills, document cards
        │   ├── ActivityLogView.js  # Chronological audit timeline
        │   └── Modals.js           # Dialogs for checkout, return, add gear, preview, and new doc
        └── utils/
            ├── icons.js            # Crisp embedded SVG icons
            └── formatters.js       # Date, relative time, and text formatters
```

---

## 🛡️ 3. Encapsulation Principles Demonstrated

The system was designed with strict object-oriented encapsulation:
1. **Private Member Fields (`#field`):** 
   - Backend domain models (`InventoryItem`, `DocumentItem`, `Folder`, `AuditLog`) protect internal fields from external modification.
   - State mutations can only occur via explicit business methods (e.g. `item.checkOut()`, `item.checkIn()`).
2. **Guarded State Transitions:**
   - Attempting to check out an item that is already `"In Use"` throws a domain error.
   - Attempting to check in an item that is `"Available"` throws a domain error.
   - Borrower names and return dates are strictly validated.
3. **Repository Pattern (Data Hiding):**
   - Controllers and services never touch raw JSON files or storage mechanisms directly; all queries and mutations are isolated within repository classes.
4. **Observable State Store in Frontend:**
   - The frontend's `Store` encapsulates application state; views cannot directly overwrite state objects. Components subscribe to granular change notifications.
5. **Zero-Dependency Dual Backend:**
   - `backend/server.js` uses standard Node.js without requiring third-party `npm` modules.
   - `backend/server.py` provides exact parity using standard Python 3.
   - `frontend/js/services/LocalStorageAdapter.js` provides automatic standalone fallback so opening `frontend/index.html` in any browser works immediately even if the backend is not running.

---

## 🚀 4. How to Run the Website

### Option A: Open Directly in Any Browser (Standalone Mode)
Simply double-click or open `frontend/index.html` in Google Chrome, Microsoft Edge, Brave, or Firefox. 
The portal will run in standalone mode with full persistence, search, checkouts, document previews, and filters powered by the built-in `LocalStorageAdapter`!

### Option B: Run with the Node.js Backend
From the project root:
```powershell
cd backend
node server.js
```
The backend API will start at `http://127.0.0.1:5000`. Then open `frontend/index.html` in your browser. The frontend will automatically detect the live backend and sync data.

### Option C: Run with the Python 3 Backend
From the project root:
```powershell
cd backend
python server.py
```
The Python server will start at `http://127.0.0.1:5000`. Open `frontend/index.html` in your browser.

---

## ☁️ 5. Hosting on Vercel

The project is pre-configured with `vercel.json` and `api/index.js` for instant deployment on [Vercel](https://vercel.com).

### Method 1: Deploy via GitHub & Vercel Dashboard (Recommended & Easiest)
1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "EcoSpark Hub portal with Vercel configuration"
   git branch -M main
   git remote add origin https://github.com/<your-username>/ecospark-hub.git
   git push -u origin main
   ```
2. **Import into Vercel:**
   - Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
   - Click **"Add New..."** → **"Project"**.
   - Select your GitHub repository from the list.
3. **Configure & Deploy:**
   - **Framework Preset:** Leave as **Other**.
   - **Root Directory:** `./` (default).
   - Vercel automatically detects `vercel.json`, which maps the `/api/*` routes to serverless functions and serves `frontend/` at the root URL.
   - Click **"Deploy"**.
4. **Done!** Vercel will give you a live production URL (e.g. `https://ecospark-hub.vercel.app`).

### Method 2: Deploy via Vercel CLI
```powershell
# 1. Install Vercel CLI globally (if not already installed)
npm i -g vercel

# 2. Login to your Vercel account
vercel login

# 3. Deploy from project root
vercel

# 4. Deploy to production
vercel --prod
```

### Method 3: Static-Only Fast Track Deployment
If you only want to host the frontend without serverless functions:
- In Vercel Project Settings, set **Root Directory** to `frontend`.
- Click **Deploy**.
- The portal will run completely standalone powered by `LocalStorageAdapter.js` with 100% features: equipment search, checkouts, returns, document tree, preview modal, and offline persistence.

---

## 🧪 6. Automated Tests
To execute the automated test suite verifying domain encapsulation, business invariants, and checkout workflows:
```powershell
cd backend
node tests/backend.test.js
```

---

## 👥 7. Built for EcoSpark Innovations
- **Classroom Tools:** Smart pens, charging hubs, document cameras, coding kits.
- **Lab & MakerLab:** 3D prototyper, oscilloscopes, digital microscopes.
- **Presentation & Computing:** Solar classroom projectors, high-performance laptops.
- **Knowledge Base:** Lesson plans, circuit schematics, brand assets, safety policies.


oshadhaekanayake09@outlook.com
