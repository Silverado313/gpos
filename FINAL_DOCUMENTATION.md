# GPOS (Gen-Z Point of Sale) - Final Documentation

## 🚀 Project Overview
GPOS is a modern, reactive Point of Sale system built with React and Firebase. It is designed for speed, security, and global flexibility, featuring real-time inventory synchronization, role-based access control, and dynamic business configurations.

## 🛠️ Technology Stack
- **Frontend**: React.js with Vite (for ultra-fast development and optimized production builds)
- **Styling**: Vanilla CSS with modern flex/grid layouts.
- **Backend / Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Auth (Role-based: Admin, Manager, Cashier)
- **State Management**: Zustand (for global auth state)

## ✨ Core Features
### 1. POS Engine (Point of Sale)
- **Hold Sale**: Suspend active carts and retrieve them later.
- **Reprint Last Receipt**: Dedicated persistent reprint button for the most recent transaction.
- **Interactive Tax**: Toggle tax (GST/VAT) per sale with custom labels.
- **Loyalty Program**: Real-time points redemption and balance tracking.

### 2. Inventory & Sales Management
- **Automatic Sync**: Real-time stock deduction upon sale and restoration upon return.
- **Sales Returns**: Protected return logic restricted to Admins/Managers.
- **Search & Filter**: Instant product and customer search.

### 3. Security (Least Privilege)
- **Role-Based UI**: Dynamic hiding of buttons (Edit/Delete/Return) based on user roles.
- **Triple-Lock Auth**: New registrations are blocked until Admin approves (Pending status).
- **Protected Routes**: Strict route-level enforcement for sensitive pages.

### 4. Global Support
- **Multi-Currency**: Global currency settings (PKR, USD, etc.) synced across the entire app.
- **Dynamic Config**: Business name, receipt footers, and tax labels are fully customizable via Settings.

## 🏗️ Architectural Foundations
The project is built on a **modular component architecture**. Key services like Firebase are abstracted into a central configuration, and global state is managed via specialized stores. This makes the codebase resilient to changes and easy to scale.

---

## 🔮 Future Extension Roadmap
GPOS is designed to be extendable. Future developers can easily add:

1. **Multi-Store Management**:
    - Extend Firestore schema to include `storeId` in all collections.
    - Implement a "Store Switcher" in the Header.
2. **Offline Mode**:
    - Integrate Service Workers and IndexDB for local cart persistence during internet outages.
3. **Advanced Analytics**:
    - Add a `sales_trends` bucket to store pre-aggregated data for faster heavy-duty reports.
4. **API Integrations**:
    - Add webhooks for E-commerce sync (Shopify/WooCommerce).

---

## 📦 Deployment Instructions
1. **Environment Setup**: Ensure `.env` contains the correct Firebase config.
2. **Build**: Run `npm run build` to generate the production bundle in the `/dist` folder.
3. **Firestore Rules**: Deploy `firestore.rules` (ensure only approved roles can write to `settings` and `products`).
4. **Hosting**: Use `firebase deploy --only hosting` for global CDN deployment.

---

**Status**: Production Ready.
**Version**: 1.0.0 (Hold & Return Update)
