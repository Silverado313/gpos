# 🛒 GPOS — General Point of Sale

> A free, open-source, Firebase-powered Point of Sale system designed to fit maximum business types — Retail, Restaurant, and Service-based businesses.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Firebase](https://img.shields.io/badge/Firebase-Free%20Tier-orange.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3-teal.svg)
![Status](https://img.shields.io/badge/status-In%20Development-yellow.svg)

---

## ✨ Features

- 🏪 **Multi Business Type** — Retail, Restaurant, Service
- 🛒 **POS Screen** — Fast checkout with cart management
- 📦 **Inventory Management** — Stock tracking with low stock alerts
- 👥 **Customer Management** — Profiles, loyalty points
- 👨‍💼 **Employee Roles** — Admin, Manager, Cashier
- 📊 **Reports & Dashboard** — Sales charts, revenue summary
- 🧾 **Receipt Generation** — Printable receipts
- 💳 **Payment Methods** — Cash, Card, Credit
- ⚙️ **Business Settings** — Tax, currency, receipt customization
- 🌙 **Dark / Light Mode**
- 📱 **PWA Ready** — Works on tablets & mobile
- 🔒 **Firebase Auth** — Secure login system
- ☁️ **Firebase Free Tier** — No hosting cost

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | Frontend UI |
| Tailwind CSS | Styling |
| Zustand | State Management |
| React Router | Navigation |
| Firebase Auth | Authentication |
| Firestore | Database |
| Firebase Hosting | Deployment |
| Vite | Build Tool |

---

# 📁 GPOS Project Tree

Complete project structure visualization with file descriptions.

---

## Directory Structure

```
gpos/
├── 📄 package.json              ⚙️ Dependencies and scripts
├── 📄 package-lock.json         🔒 Locked dependency versions
├── 📄 vite.config.js            ⚡ Vite build configuration
├── 📄 index.html                🌐 HTML entry point
├── 📄 env.example               📋 Environment variables template
├── 📄 .env                       🔐 Local environment variables (not in git)
├── 📄 eslint.config.js          🔍 ESLint configuration
├── 📄 tailwind.config.js        🎨 Tailwind CSS configuration
├── 📄 postcss.config.js         📦 PostCSS configuration
├── 📄 firebase.json             🔥 Firebase configuration
├── 📄 gitignore                 🚫 Git ignore rules
├── 📄 gpos.code-workspace       💻 VS Code workspace config
├── 📄 LICENSE                   ⚖️ MIT License
├── 📄 README.md                 📖 Project documentation
├── 📄 CONTRIBUTING.md           🤝 Contribution guidelines
├── 📄 DEPLOYMENT_GUIDE.md       🚀 Deployment instructions
├── 📄 FINAL_DOCUMENTATION.md    📚 Complete technical docs
│
├── 📁 public/                   📸 Static assets
│   ├── favicon.ico              🎯 Browser tab icon
│   ├── vite.svg                 ✨ Vite logo
│   ├── apple-touch-icon.png     📱 iOS app icon
│   ├── mask-icon.svg            🎭 Safari pinned tab
│   ├── pwa-192x192.png          📲 PWA icon (small)
│   └── pwa-512x512.png          📲 PWA icon (large)
│
├── 📁 dev-dist/                 🔧 Development build output
│   ├── sw.js                    💼 Service worker
│   └── workbox-*.js             📦 Workbox runtime
│
├── 📁 src/                      ⭐ Source code
│   ├── 📄 main.jsx              🚀 React entry point
│   ├── 📄 App.jsx               🎭 Main app component & routing
│   ├── 📄 App.css               🎨 Global app styles
│   ├── 📄 index.css             🌈 Global CSS (Tailwind)
│   │
│   ├── 📁 assets/               🖼️ Images, icons, media
│   │   └── react.svg            ⚛️ React logo
│   │
│   ├── 📁 components/           🧩 Reusable UI components
│   │   ├── 📁 layout/           📐 Layout components
│   │   │   ├── Layout.jsx       📦 Main page layout wrapper
│   │   │   ├── Navbar.jsx       🔝 Top navigation bar
│   │   │   └── Sidebar.jsx      🗂️ Sidebar navigation menu
│   │   ├── 📁 common/           🌐 Common/reusable components
│   │   │   └── (empty)
│   │   └── 📁 charts/           📊 Chart visualizations
│   │       └── (empty)
│   │
│   ├── 📁 pages/                📄 Page components (route-based)
│   │   │
│   │   ├── 📁 auth/             🔐 Authentication pages
│   │   │   ├── Login.jsx        🔓 Login form & auth
│   │   │   ├── Register.jsx     📝 User registration
│   │   │   ├── PendingApproval.jsx  ⏳ Pending approval screen
│   │   │   └── UserSettings.jsx 👤 User profile & password
│   │   │
│   │   ├── 📁 dashboard/        📊 Admin dashboard
│   │   │   └── Dashboard.jsx    📈 Main dashboard view
│   │   │
│   │   ├── 📁 pos/              💳 Point of Sale
│   │   │   └── POS.jsx          🛒 Main checkout interface
│   │   │
│   │   ├── 📁 products/         📦 Product management
│   │   │   └── Products.jsx     🏷️ Product CRUD
│   │   │
│   │   ├── 📁 inventory/        📊 Inventory management
│   │   │   ├── Inventory.jsx    📦 Stock tracking
│   │   │   ├── Suppliers.jsx    🚚 Supplier management
│   │   │   └── PurchaseOrders.jsx  🛍️ Order management
│   │   │
│   │   ├── 📁 sales/            💰 Sales & invoicing
│   │   │   ├── Sales.jsx        📋 Sales history
│   │   │   └── Invoice.jsx      🧾 Receipt/invoice view
│   │   │
│   │   ├── 📁 customers/        👥 Customer management
│   │   │   └── Customers.jsx    👤 Customer profiles
│   │   │
│   │   ├── 📁 employees/        👨‍💼 Employee management
│   │   │   └── Employees.jsx    🧑‍💻 Staff CRUD
│   │   │
│   │   ├── 📁 reports/          📈 Reporting & analytics
│   │   │   └── Reports.jsx      📊 Advanced reports
│   │   │
│   │   └── 📁 settings/         ⚙️ Application settings
│   │       ├── Settings.jsx     🔧 Business configuration
│   │       └── Documentation.jsx 📖 In-app documentation
│   │
│   ├── 📁 firebase/             🔥 Firebase services
│   │   ├── config.js            ⚙️ Firebase initialization
│   │   ├── auth.js              🔐 Authentication functions
│   │   └── firestore.js         💾 Firestore queries (optional)
│   │
│   ├── 📁 store/                🎯 State management
│   │   └── authStore.js         👤 Zustand auth store
│   │
│   ├── 📁 routes/               🛣️ Routing components
│   │   └── ProtectedRoute.jsx   🔒 Route protection HOC
│   │
│   ├── 📁 hooks/                 🪝 Custom React hooks
│   │   └── (ready for expansion)
│   │
│   ├── 📁 utils/                🛠️ Utility functions
│   │   └── (ready for expansion)
│   │
│   ├── 📁 modules/              📦 Feature modules
│   │   └── (ready for expansion)
│   │
│   └── 📁 constants/            📌 Constants & enums
│       └── (ready for expansion)
│
└── 📁 .git/                     📚 Git repository metadata

```

---

## File Statistics

| Category | Count | Purpose |
|----------|-------|---------|
| **Page Components** | 10 | Feature pages (auth, pos, inventory, etc.) |
| **Layout Components** | 3 | Navigation, layout structure |
| **Firebase Modules** | 3 | Auth, config, firestore |
| **State Management** | 1 | Zustand store |
| **Route Guards** | 1 | Protected route component |
| **Config Files** | 6 | Vite, Tailwind, ESLint, PostCSS, Firebase |
| **Documentation** | 4+ | README, guides, API docs |
| **Assets** | 7+ | Icons, images, PWA assets |

---

## Component Hierarchy

```
App.jsx (Router & Auth)
└── Routes
    ├── ProtectedRoute
    │   └── Layout.jsx
    │       ├── Navbar.jsx
    │       ├── Sidebar.jsx
    │       └── Page Content
    │           ├── Dashboard.jsx
    │           ├── POS.jsx
    │           ├── Products.jsx
    │           ├── Inventory.jsx
    │           ├── Sales.jsx
    │           ├── Customers.jsx
    │           ├── Employees.jsx
    │           ├── Reports.jsx
    │           └── Settings.jsx
    │
    └── Auth Routes (public)
        ├── Login.jsx
        ├── Register.jsx
        ├── PendingApproval.jsx
        └── UserSettings.jsx
```

---

## Firestore Collections Structure

Based on application code:

```
Firestore Database
├── users/
│   ├── {uid}
│   │   ├── email
│   │   ├── displayName
│   │   ├── role (admin|manager|cashier|pending)
│   │   └── createdAt
│
├── products/
│   ├── {productId}
│   │   ├── name
│   │   ├── price
│   │   ├── costPrice
│   │   ├── category
│   │   ├── barcode
│   │   └── unit
│
├── inventory/
│   ├── {inventoryId}
│   │   ├── productId (FK)
│   │   ├── currentStock
│   │   ├── minStock
│   │   ├── maxStock
│   │   └── lastUpdated
│
├── sales/
│   ├── {saleId}
│   │   ├── items[]
│   │   ├── subtotal
│   │   ├── tax
│   │   ├── total
│   │   ├── paymentMethod
│   │   ├── customerId (FK)
│   │   ├── cashierId (FK)
│   │   └── createdAt
│
├── customers/
│   ├── {customerId}
│   │   ├── name
│   │   ├── phone
│   │   ├── email
│   │   ├── loyaltyPoints
│   │   ├── totalSpent
│   │   └── joinDate
│
├── employees/
│   ├── {employeeId}
│   │   ├── name
│   │   ├── email
│   │   ├── role
│   │   └── joinDate
│
├── settings/
│   └── global
│       ├── businessName
│       ├── taxRate
│       ├── taxEnabled
│       ├── taxLabel
│       ├── currency
│       ├── receiptFooter
│       └── pointsRedemptionRate
│
├── suppliers/
│   ├── {supplierId}
│   │   ├── name
│   │   ├── contact
│   │   └── products[]
│
├── purchase_orders/
│   ├── {orderId}
│   │   ├── supplierId (FK)
│   │   ├── items[]
│   │   ├── status
│   │   └── createdAt
│
└── suspended_sales/
    ├── {saleId}
    │   ├── items[]
    │   ├── customerId (FK)
    │   ├── createdAt
    │   └── notes
```

---

## Key File Dependencies

### App.jsx (Central Hub)
```
App.jsx
├── Firebase (auth, config)
├── useAuthStore (Zustand)
├── All Page Components
└── ProtectedRoute
```

### POS.jsx (Core Feature)
```
POS.jsx
├── Layout.jsx
├── Firebase (sales, inventory, customers, settings)
├── State (cart, customers, settings)
└── Firestore Operations (checkout, hold sales)
```

### Dashboard.jsx
```
Dashboard.jsx
├── Layout.jsx
├── Firebase (sales, products, customers, inventory)
├── Charts/Analytics (placeholder)
└── Statistics Summary
```

---

## Build Output Structure

```
dist/
├── index.html           (Minified HTML)
├── assets/
│   ├── index-*.js       (Bundled React app)
│   ├── index-*.css      (Minified Tailwind)
│   └── react-*.svg      (Optimized assets)
└── sw.js                (Service worker for PWA)
```

---

## Environment Variables (.env)

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## Development Workflow

```
npm install         → Install dependencies
npm run dev         → Start dev server (localhost:5173)
npm run build       → Build for production
npm run lint        → Check code quality
npm run preview     → Preview production build locally
```

---

## Expansion Points (Empty Folders Ready to Use)

✓ `src/hooks/` - Custom React hooks for Firestore queries  
✓ `src/utils/` - Utility functions (formatting, validation)  
✓ `src/modules/` - Feature modules  
✓ `src/constants/` - App constants and enums  
✓ `src/components/common/` - Reusable UI components  
✓ `src/components/charts/` - Data visualization components  

---

## Total Project Size

- **Source Files**: ~25+ JSX/JS files
- **Configuration**: 6 files
- **Public Assets**: 6+ files
- **Documentation**: 4+ files
- **Dependencies**: 5 runtime + 11 dev

---

*Last Updated: February 24, 2026*

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- Firebase account (Free Tier is enough)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Silverado313/gpos.git
cd gpos
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Firestore**, **Authentication**, and **Hosting**
4. Copy your Firebase config

### 4. Setup Environment Variables

```bash
cp .env.example .env
```

Fill in your Firebase credentials in `.env`

### 5. Run Development Server

```bash
npm run dev
```

### 6. Deploy to Firebase Hosting

```bash
npm run build
firebase deploy
```

---

## 🔐 User Roles

| Role | Permissions |
|------|-------------|
| Admin | Full access |
| Manager | All except employee management |
| Cashier | POS, sales only |

---

## 🗄️ Firestore Collections

- `businesses` — business profiles
- `users` — employees & roles
- `products` — product catalog
- `categories` — product categories
- `inventory` — stock management
- `customers` — customer profiles
- `sales` — transaction history
- `expenses` — business expenses
- `settings` — business configuration

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---
## 👨‍💻 Author

**Syed Aneel Raza**
*Full Stack Developer | Firebase Enthusiast*

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/syedaneelraza)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Silverado313)
[![Website](https://img.shields.io/badge/TechPeer-Web-blue?style=for-the-badge&logo=googlechrome&logoColor=white)](https://techpeer.web.app)

---
*If you find GPOS helpful, consider giving it a ⭐ to show your support!*

## ⭐ Support

If you find this project helpful, please give it a **star** on GitHub!

> Built on Firebase Free Tier — Free forever for small businesses.
