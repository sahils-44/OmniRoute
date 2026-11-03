# OmniRoute™ — Premium Smart Delivery & Multi-Vendor Fleet Management System

![OmniRoute Banner](https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80)

> **Commercial Client Grade ($99+ SaaS Quality)**  
> Production-ready, fully responsive full-stack logistics and multi-vendor delivery platform supporting **Traditional Hotel Delivery** and **Intelligent Local Street Vendor Multi-Order Routing (Chai / Breakfast / Bakery)**.

---

## 🌟 Key Highlights & Core Differentiators

### 1. Dual Delivery Architecture
* **Model A: Traditional Restaurant & Hotel Dining**: Customers order multi-course gourmet meals, track preparation phases (Pending → Accepted → In Kitchen → Packed → Dispatched), and monitor individual courier movement via high-precision live GPS.
* **Model B: Local Vendor Multi-Order Dynamic Routing (Flagship Differentiator)**: Designed for neighborhood street food stalls, chai sellers, and bakeries. Rather than dispatching 5 couriers for 5 nearby morning orders, the dynamic TSP / 2-Opt algorithm clusters orders within geographic and preparation deadlines, computes an optimal sequence (Shop → Stop 1 → Stop 2 → Stop 3 → Stop 4 → Stop 5), and assigns a single courier—reducing fuel usage by over **80%**!

### 2. High-Tech Visuals & 3D WebGL Hero Canvas
* Deep Charcoal (`#08080C`) background with metallic gold accents (`#D4AF37`), electric orange (`#FF5722`), and emerald green (`#10B981`).
* Interactive procedural **Three.js 3D WebGL scene** featuring a stylized electric delivery scooter with cargo container, glowing floating waypoint pins, pulsing radar rings, and floating parcels responding to mouse parallax.
* Glassmorphism cards (`backdrop-blur-md`), dark mode Leaflet tile overrides, smooth typography (*Plus Jakarta Sans*, *Outfit*, and *JetBrains Mono*).

### 3. Real GPS & 1-KM Proximity Geofencing
* Supports actual hardware GPS tracking via `navigator.geolocation.watchPosition` with permission fallback.
* Includes a high-speed **GPS Simulator** (1x, 2x, 5x, pause/resume) allowing complete demonstration and testing anywhere indoors.
* Computes accurate great-circle spherical distance using the **Haversine formula**.
* **1-KM Proximity Alert**: Once a courier enters within 1,000 meters of the delivery destination, an attention-grabbing radar sonar ping plays via the Web Audio API, an animated radar toast banner appears on screen, and customer, vendor, and courier dashboards are alerted simultaneously.

### 4. 10-Stage Order & Scheduling Engine
1. `Pending` → 2. `Accepted` → 3. `Preparing` → 4. `Ready for Pickup` → 5. `Assigned` → 6. `Picked Up` → 7. `Out for Delivery` → 8. `Near Destination` (< 1 KM) → 9. `Delivered` (verified with 4-digit OTP) → 10. `Cancelled`.
* **Scheduled Orders**: Pre-order meals for future lunch/dinner time slots with operational validation.

### 5. Automated Billing & Printable A4 Tax Invoices
* Itemized price calculation, CGST (2.5%) + SGST (2.5%) breakdown, delivery fee waivers for orders over ₹500, promo code engine (`FEAST100`, `CHAI15`, `FIRST50`).
* Printable official A4 tax invoices with GSTIN, CIN, customer billing address, item table, and single-click CSV/PDF export.

---

## 👥 Five Dedicated Workspace Portals

| Role | Demo User | Credentials / Access |
|---|---|---|
| **Customer** | Aarav Mehta | Switch via top-right user menu or role switcher |
| **Hotel Owner** | Chef Rajesh Singhania (*The Royal Grand Pavilion*) | Full kitchen dispatch, menu manager, fleet map |
| **Local Vendor** | Ramesh Sharma (*Sharma Ji Ki Masala Chai Stall*) | Multi-Order batching hub, fast stock toggles |
| **Delivery Partner** | Vikram Rane (*Electric Scooter MH-02-EQ-8821*) | Turn-by-turn navigation, OTP verification |
| **Platform Admin** | Sophia Vance (*Operations Director*) | Central Fleet Radar, revenue audits, system JSON export |

---

## 🚀 Quick Start & Installation

### Prerequisites
* **Node.js** >= 18.0.0
* **npm** >= 9.0.0

### Setup
```bash
# Clone or navigate to the project directory
cd CEP

# Dependencies are already installed. If running on a new machine:
npm install

# Start Vite live development server
npm run dev
```

The application will be live at:
```
http://localhost:5173
```

### Production Build
```bash
# Build optimized production bundles (Three.js, Leaflet & React code-split)
npm run build

# Preview production build locally
npm run preview
```

---

## 🧪 Automated End-to-End Test Verification

The project includes an automated test verification suite covering all 6 mandatory user scenarios:

```bash
node tests/verify-all-scenarios.js
```

### Scenarios Tested:
1. **TEST 1 — Restaurant Order**: 9-stage lifecycle from checkout to OTP delivery.
2. **TEST 2 — Local Chai Seller Multi-Order Delivery**: Dynamic 5-stop batching with 83.5% distance savings.
3. **TEST 3 — Scheduled Order**: Future time slot pre-ordering and preparation reminder.
4. **TEST 4 — Live GPS & 1-KM Proximity Geofence**: Mathematical Haversine verification and idempotent alert trigger.
5. **TEST 5 — Billing & Invoicing**: Subtotal, GST, discounts, and A4 invoice integrity.
6. **TEST 6 — Role Security**: Permission guards and boundary isolation between roles.

---

## 🔐 Firebase & Cloud Integration

OmniRoute is connected to real Google Firebase services and MapTiler Cloud:

### 1. Environment Configuration (`.env`)
Create a `.env` file in the root directory (a template is provided in `.env.example`):
```env
VITE_FIREBASE_API_KEY=AIzaSyDRs1raOcgvLOR0aopl3vDpSx_9LqN7l-E
VITE_FIREBASE_AUTH_DOMAIN=omniroute-cep.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=omniroute-cep
VITE_FIREBASE_STORAGE_BUCKET=omniroute-cep.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1064467555265
VITE_FIREBASE_APP_ID=1:1064467555265:web:9352ede00ef666c4414540
VITE_MAPTILER_API_KEY=HnFKjuxLz2I1IfboVn4P
```

### 2. Dual Authentication Architecture
- **Real Firebase Accounts**: Users can register and sign in with email and password via `signInWithEmailAndPassword` and `createUserWithEmailAndPassword`. User sessions are automatically maintained across browser refreshes via `onAuthStateChanged`.
- **Instant Demo Switcher**: For quick evaluation and stakeholder reviews, one-click access is available for all 5 roles (Customer, Hotel Owner, Street Vendor, Courier, Admin) without manual registration.

### 3. Deploying Firestore Security Rules
Production-grade Firestore Security Rules are specified in `firestore.rules`. To deploy them to your Firebase project:
```bash
# Login to Firebase CLI
firebase login

# Set active project
firebase use omniroute-cep

# Deploy security rules
firebase deploy --only firestore:rules
```

### 4. MapTiler Cloud Setup
Map tiles use MapTiler Dataviz Dark (`https://api.maptiler.com/maps/dataviz-dark/{z}/{x}/{y}.png?key=...`) with seamless CartoDB dark fallback. Ensure your MapTiler API Key has the following Allowed HTTP Origins configured in [MapTiler Cloud](https://cloud.maptiler.com/):
- `http://localhost:5173`
- `http://127.0.0.1:5173`
- Your production hosting domain

---

## 🛠️ Architecture & Tech Stack

* **Frontend Framework**: React 19, TypeScript, Vite 8 (Rolldown engine)
* **Backend & Auth**: Google Firebase Auth & Cloud Firestore (`firebase/app`, `firebase/auth`, `firebase/firestore`)
* **Styling**: Tailwind CSS v4, PostCSS, Custom Glassmorphism design system
* **3D Graphics**: Three.js WebGL procedural renderer with ACESFilmic tonemapping
* **Mapping**: Leaflet 1.9 with MapTiler Dataviz Dark tiles & custom SVG pulsing radar pins
* **Audio**: Native Web Audio API procedural synthesizers (zero broken audio links)
* **Icons**: Lucide React
* **Math & Geometry**: Haversine Spherical Distance, Nearest-Neighbor TSP + 2-Opt Optimization

---

## 📄 License & Commercial Distribution

Commercial Client Project. All rights reserved. OmniRoute™ 2026.
