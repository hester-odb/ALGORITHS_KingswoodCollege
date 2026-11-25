/**
 * LocalStorageAdapter.js
 * Encapsulated standalone storage engine.
 * Provides complete resilience and persistence when the backend is offline or run locally via file://.
 */
class LocalStorageAdapter {
  static #STORAGE_PREFIX = 'ecospark_hub_';

  // Seed Data definition
  static #INITIAL_INVENTORY = [
    {
      id: "item-001",
      createdAt: "2026-10-15T09:00:00.000Z",
      updatedAt: "2026-11-20T14:30:00.000Z",
      name: "SolarBeam Mini Classroom Projector",
      category: "Presentation",
      serialNumber: "ES-PROJ-0101",
      location: "Room 102 - Science Lab",
      status: "In Use",
      assignedTo: "Sarah Chen",
      assignedDepartment: "Education & Curriculum",
      checkoutDate: "2026-11-18T10:15:00.000Z",
      expectedReturnDate: "2026-11-26",
      condition: "Excellent",
      notes: "Used for interactive science demonstration in Grade 7 class.",
      imageUrl: "assets/gear/projector.svg"
    },
    {
      id: "item-002",
      createdAt: "2026-10-16T11:00:00.000Z",
      updatedAt: "2026-11-22T08:00:00.000Z",
      name: "SparkPen 10-Unit Charging Station",
      category: "Classroom Tools",
      serialNumber: "ES-PEN-0402",
      location: "MakerLab - Shelf A",
      status: "Available",
      assignedTo: null,
      assignedDepartment: null,
      checkoutDate: null,
      expectedReturnDate: null,
      condition: "Excellent",
      notes: "Fully charged and updated with latest v1.8 firmware.",
      imageUrl: "assets/gear/smartpen.svg"
    },
    {
      id: "item-003",
      createdAt: "2026-10-18T14:20:00.000Z",
      updatedAt: "2026-11-19T16:45:00.000Z",
      name: "AirSpark Classroom Environmental Sensor Hub",
      category: "Sensors & Robotics",
      serialNumber: "ES-SENS-0819",
      location: "Room 105 - Tech Workshop",
      status: "In Use",
      assignedTo: "Marcus Brody",
      assignedDepartment: "Hardware Engineering",
      checkoutDate: "2026-11-19T13:00:00.000Z",
      expectedReturnDate: "2026-11-25",
      condition: "Good",
      notes: "Testing CO2 calibration and solar battery buffer.",
      imageUrl: "assets/gear/sensor-hub.svg"
    },
    {
      id: "item-004",
      createdAt: "2026-10-20T10:00:00.000Z",
      updatedAt: "2026-11-21T09:10:00.000Z",
      name: "ThinkPad P16 Tech Lead Laptop",
      category: "Computing",
      serialNumber: "ES-LAP-0921",
      location: "Tech Stash - Cabinet 2",
      status: "Available",
      assignedTo: null,
      assignedDepartment: null,
      checkoutDate: null,
      expectedReturnDate: null,
      condition: "Excellent",
      notes: "Re-imaged with Ubuntu 24.04 and CAD suite.",
      imageUrl: "assets/gear/laptop-lead.svg"
    },
    {
      id: "item-005",
      createdAt: "2026-10-22T08:30:00.000Z",
      updatedAt: "2026-11-23T11:00:00.000Z",
      name: "RoboSpark Modular STEM Coding Kit",
      category: "Sensors & Robotics",
      serialNumber: "ES-ROBO-0311",
      location: "Room 102 - Science Lab",
      status: "In Use",
      assignedTo: "Aisha Patel",
      assignedDepartment: "Community Outreach",
      checkoutDate: "2026-11-21T09:30:00.000Z",
      expectedReturnDate: "2026-11-27",
      condition: "Good",
      notes: "Weekend workshop with school partners.",
      imageUrl: "assets/gear/robotics-kit.svg"
    },
    {
      id: "item-006",
      createdAt: "2026-10-25T13:00:00.000Z",
      updatedAt: "2026-11-20T10:00:00.000Z",
      name: "Wireless Digital Lab Microscope 1000x",
      category: "Lab Tools",
      serialNumber: "ES-MIC-0744",
      location: "MakerLab - Optics Bench",
      status: "Available",
      assignedTo: null,
      assignedDepartment: null,
      checkoutDate: null,
      expectedReturnDate: null,
      condition: "Excellent",
      notes: "Calibrated optics and clean lenses. USB-C and WiFi enabled.",
      imageUrl: "assets/gear/microscope.svg"
    },
    {
      id: "item-007",
      createdAt: "2026-10-28T15:40:00.000Z",
      updatedAt: "2026-11-15T12:00:00.000Z",
      name: "Classroom SoundSpark PA & Wireless Mic",
      category: "Audio/Visual",
      serialNumber: "ES-AUD-0199",
      location: "Main Office - AV Rack",
      status: "Available",
      assignedTo: null,
      assignedDepartment: null,
      checkoutDate: null,
      expectedReturnDate: null,
      condition: "Good",
      notes: "Two wireless lavalier microphones included.",
      imageUrl: "assets/gear/sound-pa.svg"
    },
    {
      id: "item-008",
      createdAt: "2026-11-01T09:20:00.000Z",
      updatedAt: "2026-11-22T17:15:00.000Z",
      name: "Dell Precision Mobile Workstation 15",
      category: "Computing",
      serialNumber: "ES-LAP-0922",
      location: "Room 105 - Tech Workshop",
      status: "In Use",
      assignedTo: "Dr. Elena Vance",
      assignedDepartment: "R&D",
      checkoutDate: "2026-11-17T09:00:00.000Z",
      expectedReturnDate: "2026-11-28",
      condition: "Excellent",
      notes: "Simulating thermal airflow for new solar projector casing.",
      imageUrl: "assets/gear/workstation.svg"
    },
    {
      id: "item-009",
      createdAt: "2026-11-05T11:15:00.000Z",
      updatedAt: "2026-11-21T15:00:00.000Z",
      name: "Rigol 4-Channel Digital Oscilloscope 100MHz",
      category: "Lab Tools",
      serialNumber: "ES-LAB-0552",
      location: "MakerLab - Electronics Bench",
      status: "Available",
      assignedTo: null,
      assignedDepartment: null,
      checkoutDate: null,
      expectedReturnDate: null,
      condition: "Excellent",
      notes: "Includes 4 probes and logic analyzer clip set.",
      imageUrl: "assets/gear/oscilloscope.svg"
    },
    {
      id: "item-010",
      createdAt: "2026-11-08T16:00:00.000Z",
      updatedAt: "2026-11-23T10:45:00.000Z",
      name: "VR Classroom Explorer Headset Set (4x)",
      category: "Classroom Tools",
      serialNumber: "ES-VR-0804",
      location: "Main Office - Secure Locker",
      status: "In Use",
      assignedTo: "Kevin O'Connor",
      assignedDepartment: "Product Design",
      checkoutDate: "2026-11-22T14:00:00.000Z",
      expectedReturnDate: "2026-11-25",
      condition: "Excellent",
      notes: "Preloaded with interactive solar system tour.",
      imageUrl: "assets/gear/vr-headset.svg"
    },
    {
      id: "item-011",
      createdAt: "2026-11-10T08:00:00.000Z",
      updatedAt: "2026-11-20T12:00:00.000Z",
      name: "DocuSpark 4K Document Visualizer Camera",
      category: "Presentation",
      serialNumber: "ES-CAM-0331",
      location: "Room 102 - Science Lab",
      status: "Available",
      assignedTo: null,
      assignedDepartment: null,
      checkoutDate: null,
      expectedReturnDate: null,
      condition: "Good",
      notes: "Flexible gooseneck with built-in LED illumination.",
      imageUrl: "assets/gear/doc-camera.svg"
    },
    {
      id: "item-012",
      createdAt: "2026-11-12T13:40:00.000Z",
      updatedAt: "2026-11-22T09:30:00.000Z",
      name: "SparkPrint Portable 3D Rapid Prototyper",
      category: "Lab Tools",
      serialNumber: "ES-3DP-0019",
      location: "MakerLab - 3D Printing Corner",
      status: "In Use",
      assignedTo: "Marcus Brody",
      assignedDepartment: "Hardware Engineering",
      checkoutDate: "2026-11-20T11:00:00.000Z",
      expectedReturnDate: "2026-11-26",
      condition: "Good",
      notes: "Printing pen holder prototypes using PLA eco-filament.",
      imageUrl: "assets/gear/3d-printer.svg"
    }
  ];

  static #INITIAL_FOLDERS = [
    {
      id: "folder-001",
      name: "Classroom Kits & Guides",
      parentId: null,
      icon: "book-open",
      color: "#10B981",
      description: "Teacher manuals, lesson plans, and classroom activity guides for EcoSpark tools."
    },
    {
      id: "folder-002",
      name: "Hardware Schematics & 3D Specs",
      parentId: null,
      icon: "cpu",
      color: "#06B6D4",
      description: "Circuits, PCB layouts, CAD diagrams, and 3D printing STL models."
    },
    {
      id: "folder-003",
      name: "Design & Brand Notes",
      parentId: null,
      icon: "palette",
      color: "#8B5CF6",
      description: "Brand colors, typography, UI wireframes, and design system components."
    },
    {
      id: "folder-004",
      name: "Office Policies & Onboarding",
      parentId: null,
      icon: "shield-check",
      color: "#F59E0B",
      description: "Staff handbooks, equipment check-out rules, and safety protocols."
    },
    {
      id: "folder-005",
      name: "Software & Firmware",
      parentId: null,
      icon: "code",
      color: "#3B82F6",
      description: "API specifications, microcontroller source code, and release logs."
    }
  ];

  static #INITIAL_DOCS = [
    {
      id: "doc-001",
      createdAt: "2026-10-12T10:00:00.000Z",
      updatedAt: "2026-11-15T14:00:00.000Z",
      title: "SparkPen Interactive Classroom Teacher Guide",
      filename: "SparkPen-Teacher-Guide-v2.4.pdf",
      folderId: "folder-001",
      category: "Guides & Manuals",
      fileType: "pdf",
      fileSize: "2.8 MB",
      author: "Dr. Elena Vance",
      description: "Complete classroom implementation guide covering Bluetooth sync, real-time handwriting digitization, and interactive quiz integration.",
      tags: ["guide", "sparkpen", "curriculum", "stem"],
      content: "# SparkPen Interactive Classroom Teacher Guide (v2.4)\n\n## Overview\nThe SparkPen enables teachers and students to digitize whiteboards and notebooks seamlessly.\n\n### Quick Start Steps:\n1. Ensure the SparkPen Charging Station LED shows solid green.\n2. Tap the pen nib on the calibration card.\n3. Open EcoSpark Classroom App on your tablet or projector.\n4. Real-time vector strokes will appear with less than 12ms latency.",
      version: "2.4"
    },
    {
      id: "doc-002",
      createdAt: "2026-10-18T11:30:00.000Z",
      updatedAt: "2026-11-10T16:20:00.000Z",
      title: "AirSpark Sensor Hub Circuit Schematics Rev C",
      filename: "AirSpark-Hub-Schematic-RevC.pdf",
      folderId: "folder-002",
      category: "Hardware Specs",
      fileType: "cad",
      fileSize: "5.4 MB",
      author: "Marcus Brody",
      description: "Electrical engineering schematic diagram with ESP32-S3 microcontroller, Sensirion SCD40 CO2 sensor, and solar battery charging IC.",
      tags: ["hardware", "schematic", "sensors", "pcb"],
      content: "# AirSpark Sensor Hub - Rev C Electrical Architecture\n\n- MCU: Espressif ESP32-S3-WROOM-1 (16MB Flash, 8MB PSRAM)\n- CO2 Sensor: Sensirion SCD40 Photoacoustic sensor (I2C 0x62)\n- Temp/Humidity: SHT40 (I2C 0x44)\n- PM2.5/PM10: Plantower PMS7003 via UART2\n- Power: 2500mAh LiFePO4 with TP4056 + Solar input range 4.5V-9.0V",
      version: "Rev C"
    },
    {
      id: "doc-003",
      createdAt: "2026-10-22T09:00:00.000Z",
      updatedAt: "2026-11-05T10:15:00.000Z",
      title: "EcoSpark Design System & Classroom Brand Book",
      filename: "EcoSpark-Brand-System-2026.pdf",
      folderId: "folder-003",
      category: "Design Notes",
      fileType: "pdf",
      fileSize: "14.2 MB",
      author: "Kevin O'Connor",
      description: "Comprehensive design language: Emerald Green (#10B981) for vitality, Spark Cyan (#06B6D4) for smart tech, and Amber (#F59E0B) for active alerts.",
      tags: ["brand", "design", "ui", "colors"],
      content: "# EcoSpark Design System & UI Tokens\n\n## Core Palette:\n- Emerald Forest: #059669 (Primary Brand)\n- Spark Green: #10B981 (Accent / Available)\n- Energy Amber: #F59E0B (In Use / Warning)\n- Tech Cyan: #06B6D4 (Interactive Spark)\n- Deep Slate: #0F172A (Typography & Structure)\n- Off-White Canvas: #F8FAFC (Clean Background)",
      version: "3.1"
    },
    {
      id: "doc-004",
      createdAt: "2026-10-25T14:00:00.000Z",
      updatedAt: "2026-11-12T09:00:00.000Z",
      title: "Equipment Check-Out & Asset Care Protocol",
      filename: "EcoSpark-Equipment-Policy-2026.docx",
      folderId: "folder-004",
      category: "Operations",
      fileType: "doc",
      fileSize: "48 KB",
      author: "Aisha Patel",
      description: "Standard operating procedure for checking out projectors, laptops, and lab tools. Defines 7-day max checkout limit and condition reporting.",
      tags: ["policy", "operations", "onboarding", "rules"],
      content: "# EcoSpark Innovations - Equipment Management Policy\n\n1. **Always Log Check-Outs:** No item may leave the storage cabinet without logging the borrower in the EcoSpark Hub.\n2. **Default Checkout Duration:** 7 calendar days. Extensions must be renewed in the portal.\n3. **Condition Checks:** Return items in clean condition and report any worn components immediately.",
      version: "1.2"
    },
    {
      id: "doc-005",
      createdAt: "2026-11-02T16:30:00.000Z",
      updatedAt: "2026-11-18T11:45:00.000Z",
      title: "Classroom Web Hub REST API Specification",
      filename: "EcoSpark-REST-API-Spec.md",
      folderId: "folder-005",
      category: "Software & Firmware",
      fileType: "markdown",
      fileSize: "36 KB",
      author: "Marcus Brody",
      description: "Technical documentation for internal endpoints (/api/inventory, /api/documents, /api/stats, /api/activity) with request/response schemas.",
      tags: ["api", "software", "docs", "backend"],
      content: "# EcoSpark REST API Specification\n\nAll endpoints return JSON responses with standardized envelope: `{ success: true, data: [...] }`.\n\n### Endpoints:\n- `GET /api/inventory` - Search & filter equipment\n- `POST /api/inventory/:id/checkout` - Check out gear\n- `POST /api/inventory/:id/checkin` - Return gear to available stock\n- `GET /api/documents` - Search & explore files by folder\n- `GET /api/stats` - Live KPIs",
      version: "2.0"
    },
    {
      id: "doc-006",
      createdAt: "2026-11-08T09:15:00.000Z",
      updatedAt: "2026-11-21T13:00:00.000Z",
      title: "RoboSpark Micro:bit STEM Lesson Modules 1-6",
      filename: "RoboSpark-STEM-Modules-1-6.pdf",
      folderId: "folder-001",
      category: "Guides & Manuals",
      fileType: "pdf",
      fileSize: "4.1 MB",
      author: "Sarah Chen",
      description: "Six hands-on classroom coding activities for middle schools: line-following, obstacle avoidance, solar tracking, and environmental alarms.",
      tags: ["stem", "robotics", "lesson-plan", "curriculum"],
      content: "# RoboSpark STEM Curriculum: Modules 1 to 6\n\n- Module 1: Hello Robot! Motor basics and LED matrix smiles\n- Module 2: Ultrasonic Echo Mapping\n- Module 3: Light Seeking Sunflower Algorithm\n- Module 4: Environmental Temperature Warning Siren\n- Module 5: Bluetooth Swarm Choreography\n- Module 6: Autonomous Classroom Navigator",
      version: "1.4"
    },
    {
      id: "doc-007",
      createdAt: "2026-11-14T11:00:00.000Z",
      updatedAt: "2026-11-22T10:00:00.000Z",
      title: "Solar Projector Heat-Dissipation Enclosure 3D CAD",
      filename: "SolarBeam-Projector-CAD-V3.stl",
      folderId: "folder-002",
      category: "Hardware Specs",
      fileType: "cad",
      fileSize: "8.9 MB",
      author: "Marcus Brody",
      description: "Parametric 3D printable chassis with integrated heatsink vents for the 120-lumen LED classroom projector.",
      tags: ["cad", "3d-print", "hardware", "projector"],
      content: "# SolarBeam Enclosure 3D Model Spec\n\n- Material: PETG or Recycled PLA\n- Infill: 25% Gyroid\n- Layer Height: 0.20mm\n- Print Time: ~6h 45m on SparkPrint 3D Prototyper",
      version: "3.0"
    },
    {
      id: "doc-008",
      createdAt: "2026-11-17T15:00:00.000Z",
      updatedAt: "2026-11-23T08:30:00.000Z",
      title: "New Team Member Welcome & IT Access Pack",
      filename: "EcoSpark-Welcome-Kit.pdf",
      folderId: "folder-004",
      category: "Operations",
      fileType: "pdf",
      fileSize: "1.1 MB",
      author: "Aisha Patel",
      description: "Quick onboarding guide covering Slack channels, GitHub repos, MakerLab door codes, and internal hub usage.",
      tags: ["onboarding", "culture", "guide", "office"],
      content: "# Welcome to EcoSpark Innovations! 🚀\n\nWe build smart, joyful tools that bring classrooms to life.",
      version: "1.0"
    }
  ];

  static #INITIAL_ACTIVITY = [
    {
      id: "audit-001",
      createdAt: "2026-11-22T14:00:00.000Z",
      action: "CHECKOUT",
      entityType: "INVENTORY",
      entityId: "item-010",
      entityName: "VR Classroom Explorer Headset Set (4x)",
      performedBy: "Kevin O'Connor",
      details: {
        assignedTo: "Kevin O'Connor",
        department: "Product Design",
        expectedReturnDate: "2026-11-25"
      }
    },
    {
      id: "audit-002",
      createdAt: "2026-11-21T09:30:00.000Z",
      action: "CHECKOUT",
      entityType: "INVENTORY",
      entityId: "item-005",
      entityName: "RoboSpark Modular STEM Coding Kit",
      performedBy: "Aisha Patel",
      details: {
        assignedTo: "Aisha Patel",
        department: "Community Outreach",
        expectedReturnDate: "2026-11-27"
      }
    },
    {
      id: "audit-003",
      createdAt: "2026-11-20T11:00:00.000Z",
      action: "CHECKOUT",
      entityType: "INVENTORY",
      entityId: "item-012",
      entityName: "SparkPrint Portable 3D Rapid Prototyper",
      performedBy: "Marcus Brody",
      details: {
        assignedTo: "Marcus Brody",
        department: "Hardware Engineering",
        expectedReturnDate: "2026-11-26"
      }
    }
  ];

  static #load(key, fallback) {
    try {
      const data = localStorage.getItem(this.#STORAGE_PREFIX + key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  static #save(key, data) {
    try {
      localStorage.setItem(this.#STORAGE_PREFIX + key, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  static getInventory() {
    let items = this.#load('inventory', this.#INITIAL_INVENTORY);
    
    // Auto-migrate legacy external Unsplash URLs to reliable, offline-ready local assets
    const localAssetMap = {
      'item-001': 'assets/gear/projector.svg',
      'item-002': 'assets/gear/smartpen.svg',
      'item-003': 'assets/gear/sensor-hub.svg',
      'item-004': 'assets/gear/laptop-lead.svg',
      'item-005': 'assets/gear/robotics-kit.svg',
      'item-006': 'assets/gear/microscope.svg',
      'item-007': 'assets/gear/sound-pa.svg',
      'item-008': 'assets/gear/workstation.svg',
      'item-009': 'assets/gear/oscilloscope.svg',
      'item-010': 'assets/gear/vr-headset.svg',
      'item-011': 'assets/gear/doc-camera.svg',
      'item-012': 'assets/gear/3d-printer.svg'
    };

    let updated = false;
    items = items.map(item => {
      if (item.imageUrl && (item.imageUrl.includes('unsplash.com') || item.imageUrl.startsWith('http'))) {
        if (localAssetMap[item.id]) {
          item.imageUrl = localAssetMap[item.id];
          updated = true;
        } else {
          item.imageUrl = 'assets/gear/default-gear.svg';
          updated = true;
        }
      } else if (!item.imageUrl) {
        item.imageUrl = localAssetMap[item.id] || 'assets/gear/default-gear.svg';
        updated = true;
      }
      return item;
    });

    if (updated) {
      this.saveInventory(items);
    }
    return items;
  }

  static resetAllData() {
    this.saveInventory(this.#INITIAL_INVENTORY);
    this.saveFolders(this.#INITIAL_FOLDERS);
    this.saveDocuments(this.#INITIAL_DOCS);
    this.#save('activity', this.#INITIAL_ACTIVITY);
    console.log('🔄 All EcoSpark sample data and offline images have been reset to defaults.');
  }

  static saveInventory(list) {
    this.#save('inventory', list);
  }

  static getFolders() {
    const folders = this.#load('folders', this.#INITIAL_FOLDERS);
    const docs = this.getDocuments();
    return folders.map(f => ({
      ...f,
      itemCount: docs.filter(d => d.folderId === f.id).length
    }));
  }

  static saveFolders(list) {
    this.#save('folders', list);
  }

  static getDocuments() {
    return this.#load('documents', this.#INITIAL_DOCS);
  }

  static saveDocuments(list) {
    this.#save('documents', list);
  }

  static getActivity() {
    return this.#load('activity', this.#INITIAL_ACTIVITY);
  }

  static logActivity(action, entityType, entityId, entityName, performedBy, details = {}) {
    const list = this.getActivity();
    const entry = {
      id: 'audit-' + Date.now(),
      createdAt: new Date().toISOString(),
      action,
      entityType,
      entityId,
      entityName,
      performedBy: performedBy || 'EcoSpark Staff',
      details
    };
    list.unshift(entry);
    this.#save('activity', list.slice(0, 50));
    return entry;
  }
}

window.LocalStorageAdapter = LocalStorageAdapter;
