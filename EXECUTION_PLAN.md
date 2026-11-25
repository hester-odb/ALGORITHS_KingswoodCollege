# EcoSpark Innovations - Internal Operations Hub
## Architectural Execution Plan & Technical Specification

---

### 1. Executive Summary & Context
**EcoSpark Innovations** is a fast-growing startup developing interactive smart tools for classrooms and local offices (e.g., interactive smart pens, ambient environmental sensor kits, solar-powered classroom mini-projectors, modular robotics hubs). 

Rapid growth has introduced two critical operational bottlenecks:
1. **Supplies & Gear Chaos:** Physical equipment (projectors, laptops, lab testing kits, measurement tools) moves between classrooms, workshops, and offices without clear tracking of who possesses what and when items will be returned.
2. **Document & Knowledge Fragmentation:** Technical guides, hardware schematics, classroom activity notes, and project design specifications are scattered across disparate storage locations.

**Objective:** Design and engineer an intuitive, robust, and responsive internal web hub ("**EcoSpark Hub**") featuring:
- A visual **Supplies & Gear Inventory** with instant search, status badges ("Available" vs. "In Use"), one-click checkout/return, and audit logging.
- An organized **Document & File Explorer** featuring hierarchical folder structures, categorization, tags, and document previews.
- A modern, clean, responsive UI with EcoSpark branding, universal quick search, and staff profiles.
- Strict **encapsulation** across both backend and frontend layers with clean directory separation.

---

### 2. Architectural Blueprint & Directory Layout

The project enforces strict separation of concerns with isolated `frontend/` and `backend/` directories:

```
ALGORITHS_Schoolname_TopicNo/
├── EXECUTION_PLAN.md               # Detailed architectural roadmap & specifications
├── README.md                       # Complete launch instructions, API docs, architecture guide
├── backend/                        # Independent backend service
│   ├── package.json                # Node.js project manifest & scripts
│   ├── server.js                   # Zero-dependency native Node.js HTTP REST API server
│   ├── server.py                   # Alternative zero-dependency Python 3 HTTP REST server
│   ├── src/
│   │   ├── config/
│   │   │   └── AppConfig.js        # Encapsulated configuration (port, paths, defaults)
│   │   ├── models/                 # Domain Entities with internal validation & state invariants
│   │   │   ├── BaseEntity.js       # Base model with UUID, timestamps, serialization
│   │   │   ├── InventoryItem.js    # Encapsulates item state transitions (checkOut, checkIn)
│   │   │   ├── DocumentItem.js     # Encapsulates file metadata, tags, and categorization
│   │   │   ├── Folder.js           # Encapsulates hierarchical pathing & child counts
│   │   │   └── AuditLog.js         # Immutable audit event entity
│   │   ├── repositories/           # Data Access Layer (encapsulates JSON/storage operations)
│   │   │   ├── BaseRepository.js   # Generic CRUD, filtering, indexing, and disk persistence
│   │   │   ├── InventoryRepository.js # Item-specific queries (by status, category, location)
│   │   │   └── DocumentRepository.js  # Document-specific queries (by folder, tags, type)
│   │   │   └── FolderRepository.js    # Hierarchical folder queries & path traversal
│   │   ├── services/               # Business Logic Layer (encapsulates workflow rules)
│   │   │   ├── InventoryService.js # Checkout, return, item creation, stock analytics
│   │   │   ├── DocumentService.js  # Folder creation, file upload/categorization, tagging
│   │   │   └── AuditService.js     # Event logging & activity timeline compilation
│   │   ├── controllers/            # Request handlers (encapsulates HTTP parsing & serialization)
│   │   │   ├── InventoryController.js
│   │   │   ├── DocumentController.js
│   │   │   └── StatsController.js
│   │   ├── routes/                 # Route Dispatcher & Middleware
│   │   │   ├── Router.js           # Clean pattern-matching URL router
│   │   │   └── Middleware.js       # CORS headers, JSON body parsing, error handling
│   │   └── data/                   # Persistent seed data stores
│   │       ├── inventory.json      # Equipment & supplies records
│   │       ├── documents.json      # Project files, guides, and notes records
│   │       ├── folders.json        # Folder hierarchy definitions
│   │       └── audit_logs.json     # Action history
│   └── tests/
│       └── backend.test.js         # Automated backend test suite
│
└── frontend/                       # Independent client application
    ├── index.html                  # Semantic, accessible HTML5 single-page hub
    ├── css/
    │   ├── variables.css           # Design tokens: EcoSpark greens (#059669, #10B981), spark cyan (#06B6D4), amber (#F59E0B)
    │   ├── base.css                # Typography, global reset, layout containers
    │   ├── components.css          # Encapsulated component styles (badges, cards, modals, table)
    │   └── utilities.css           # Responsive grid, flexbox utilities, animations
    ├── js/
    │   ├── app.js                  # Entry point, dependency injection, and initial view mount
    │   ├── state/
    │   │   └── Store.js            # Encapsulated state store with Observer / Pub-Sub pattern
    │   ├── services/               # Communication & data layer
    │   │   ├── ApiClient.js        # Encapsulated HTTP client with error handling
    │   │   ├── InventoryService.js # Supply & Gear API caller
    │   │   ├── DocumentService.js  # File & Folder API caller
    │   │   └── LocalStorageAdapter.js # Standalone resilient fallback for offline/browser-only usage
    │   ├── models/                 # Frontend Domain View Models
    │   │   ├── ItemViewModel.js    # Client-side presentation logic & validation
    │   │   └── DocumentViewModel.js# File size/type formatting & path resolution
    │   ├── components/             # Self-contained UI components
    │   │   ├── Navbar.js           # Header, tab navigation, search bar, active user switcher
    │   │   ├── QuickStats.js       # Metric cards (Total, Available, In Use, Docs count)
    │   │   ├── InventoryView.js    # Filter bar, item cards / table, checkout status badges
    │   │   ├── DocumentExplorer.js # Folder sidebar, file grid/list, breadcrumbs, search
    │   │   ├── ActivityLogView.js  # Chronological audit timeline of equipment moves
    │   │   ├── ItemModal.js        # Add/edit gear modal with form validation
    │   │   ├── CheckoutModal.js    # Modal for checking out gear to staff or checking in
    │   │   ├── DocumentModal.js    # Add/view document modal with tags and folder selector
    │   │   └── Toast.js            # Notification banner for success/warning/error feedback
    │   └── utils/
    │       ├── formatters.js       # Date, relative time, and size formatters
    │       └── icons.js            # Embedded crisp SVG icon registry
    └── assets/
        ├── favicon.svg             # EcoSpark logo icon
        └── gear/                   # 13 Dedicated offline vector equipment illustrations (SVG)
```

---

### 3. Encapsulation Strategy Across Layers

Encapsulation ensures high cohesion and loose coupling by protecting internal state and enforcing access solely through well-defined public interfaces:

#### A. Backend Encapsulation:
1. **Domain Models (`models/`):**
   - Private attributes via `#field` syntax or closures.
   - Guarded invariants: An `InventoryItem` cannot be transitioned to `"In Use"` without a valid borrower name and return date; an already `"Available"` item cannot be checked in.
   - Self-validating entities: Each model validates its own required fields and formats before persisting.
2. **Repository Pattern (`repositories/`):**
   - Direct file I/O and JSON parsing are strictly encapsulated within repository classes.
   - Exposes clean query methods (`findById`, `findAll`, `findAvailable`, `findByFolder`, `save`, `delete`).
3. **Service Layer (`services/`):**
   - Encapsulates multi-entity workflows (e.g., checking out an item automatically creates an immutable `AuditLog` entry and updates inventory indices).
   - Controllers never touch repositories directly; they communicate only through service methods.
4. **Controllers & Router (`controllers/`, `routes/`):**
   - Request serialization, HTTP header management, status codes, and error formatting are encapsulated.

#### B. Frontend Encapsulation:
1. **Centralized Observable Store (`state/Store.js`):**
   - The application state is private.
   - External components cannot directly mutate state; they dispatch actions or call store methods.
   - Components subscribe to state changes via an observer pattern, re-rendering only their isolated views.
2. **API & Storage Abstraction (`services/`):**
   - Components do not use `fetch()` directly; they call `InventoryService` or `DocumentService`.
   - The service layer abstracts network failure: if the backend server is temporarily offline or running in standalone file mode, `LocalStorageAdapter` takes over seamlessly without the UI breaking.
3. **Component Encapsulation (`components/`):**
   - Each component is an isolated ES6 class that owns its DOM container, internal rendering lifecycle, and local event handlers.
   - No leaking of global variables or styles.

---

### 4. Detailed Feature Specifications

#### Feature 1: Track Supplies & Gear
- **Visual Inventory Display:** Dual view (Card Grid and Structured Table) showing item photo/icon, item name, model, serial number, location (e.g. *Room 102 - Classroom Lab*, *Mobile Cart B*), category, and status.
- **Availability Badges:**
  - `Available` (Emerald green badge, ready for immediate checkout).
  - `In Use` (Amber badge showing current holder, checkout date, and expected return).
- **Search & Filter:** Real-time fuzzy search by keyword; filter pills by Category (*Classroom Tools*, *Computing & Laptops*, *Audio/Visual*, *Sensors & Robotics*, *Lab Equipment*) and Status (*All*, *Available*, *In Use*).
- **Checkout / Check-in Modal:**
  - One-click checkout: select staff member, department, expected return date, and optional checkout note.
  - One-click check-in: return item to inventory with condition update (*Excellent*, *Good*, *Needs Attention*).
- **Add New Equipment:** Form with validation to register newly acquired tools into the EcoSpark hub.

#### Feature 2: Organize Files & Documents
- **Folder Tree & Hierarchy:** Folders representing EcoSpark departments and operations:
  - `📁 Classroom Kits & Guides` (lesson plans, interactive pen guides)
  - `📁 Hardware Schematics` (sensor circuit boards, 3D printing STL files)
  - `📁 Design & Brand Notes` (color palettes, logo assets, UI mockups)
  - `📁 Office Policies & Onboarding` (handbooks, safety protocols)
  - `📁 Software & Firmware` (microcontroller code, companion app docs)
- **Document Explorer:**
  - Breadcrumb navigation with one-click folder jumping.
  - Search files across all folders or within current folder.
  - Tag filtering (e.g., `#stem`, `#hardware`, `#v2.0`, `#guide`, `#confidential`).
  - File details: Name, Category, Size, Last Modified, Author, and Tags.
  - Document Preview Modal: Preview markdown, code, notes, and specifications directly in the browser with simulated download.
  - New File Upload Modal: Add documents with title, folder destination, category, author, and description.

#### Feature 3: Clean, Usable & Intuitive UI/UX
- **EcoSpark Brand Design:** Modern clean aesthetic with emerald/mint green accents, spark highlights, smooth shadows, and micro-interactions.
- **KPI Summary Cards:** Live counters at the top displaying Total Assets, Available Gear, Active Checkouts, and Total Project Documents.
- **Universal Quick Search:** Top navigation bar search with instant results.
- **Staff Switcher:** Dropdown in navbar to simulate different EcoSpark team members (e.g., *Dr. Elena Vance - Curriculum Lead*, *Marcus Brody - Hardware Eng*, *Aisha Patel - Office Operations*).
- **Activity Feed & Audit Trail:** Dedicated tab showing chronological log of recent equipment checkouts, returns, and document updates.
- **Toast Notifications:** Floating feedback alerts for every successful action.

---

### 5. Implementation Steps & Milestones

1. **Step 1: Execution Plan & Architecture Setup** (Completed)
2. **Step 2: Backend Architecture & Implementation** (In Progress)
3. **Step 3: Frontend Architecture & Implementation**
4. **Step 4: Seed Realistic Startup Data**
5. **Step 5: Verification, Testing & Documentation**
