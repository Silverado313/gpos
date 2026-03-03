# 🚀 GPOS | Enterprise Point of Sale Ecosystem

**GPOS (General Point of Sale)** is a high-performance, cloud-integrated retail management ecosystem. It transforms standard point-of-sale operations into a data-driven business intelligence platform.

---

## 📑 Table of Contents
1. [Core Sales & POS](#-core-sales--pos)
2. [Inventory & Procurement](#-inventory--procurement)
3. [Financial Intelligence](#-financial-intelligence)
4. [Staff & Security](#-staff--security)
5. [Technical Resilience](#-technical-resilience)
6. [System Utilities](#-system-utilities)

---

## 🛒 Core Sales & POS
*The primary interface for customer interactions and revenue generation.*

- **✨ Dynamic Cart Management**: Real-time price calculation, tax application, and line-item/global discount controls.
- **💳 Multi-Channel Payments**: support for **Cash**, **Card**, and **Credit** (linking sales to customer balances).
- **⚖️ Tax Intelligence**: Configurable tax labels and dynamic toggles to include/exclude tax during checkout.
- **⏸️ Held Sales (Parked Orders)**: "Hold" up to 20 active carts to the cloud, allowing cashiers to serve other customers without losing progress.
- **🔄 Sales Return System**: Professional return workflow with manager-override security. Automatically restocks inventory upon return.
- **🏆 Loyalty & Rewards**: Integrated point accumulation system with instant "Redemption" during checkout.
- **📄 Digital Receipts**: Branded, printable HTML receipts generated for every transaction with a built-in "Print Receipt" feature for history.
- **👥 Customer CRM**: Centralized database to track purchase history, outstanding balances (Credit), and contact preferences.

---

## 📦 Inventory & Procurement
*Moving beyond simple tracking to automated asset management.*

- **🔗 Product-Inventory Linkage**: New products automatically spin up inventory records. Deleting a product safely removes associated stock data.
- **💎 Valuation Analysis**: Live financial reporting on **Asset Value** (at cost) and **Potential Revenue** (at retail).
- **🏭 Supplier Management**: Full database for vendor contact management and historical order tracking.
- **📝 Purchase Orders (PO)**: Professional PO creation with printable order sheets and "One-Click Receive" restocking.
- **⚠️ Low Stock Alerts**: Proactive monitoring with visual warnings in the Dashboard when items hit customizable minimum thresholds.

---

## 📊 Financial Intelligence
*Professional-grade bookkeeping integrated directly into the sale.*

- **🏧 Automated Cash Flow**: Every cash sale is instantly recorded in the Register history via Auto-Sync.
- **💸 Expense Tracking**: Monitor overheads (Rent, Utilities, Salaries) with categorized reporting.
- **📈 Profit & Loss (P&L) Engine**:
    - **COGS Tracking**: Captures the specific cost of an item at the moment of sale for precise margins.
    - **Profit Breakdown**: Calculates Gross Profit and true Net Profit (after all expenses).
- **📋 Register Reconciliation**: Security-focused "End of Day" workflow comparing digital records vs physical cash.

---

## 🛡️ Staff & Security
*Robust controls to prevent shrinkage and standardize operations.*

- **👨‍💼 Employee Management**: Centralized staff directory with specific permission profiles.
- **🔒 Role-Based Access (RBAC)**:

| Feature | Admin | Manager | Cashier |
| :--- | :---: | :---: | :---: |
| POS & Checkout | ✅ | ✅ | ✅ |
| Customer History | ✅ | ✅ | ✅ |
| Inventory Adjust | ✅ | ✅ | ❌ |
| Financial Reports | ✅ | ✅ | ❌ |
| System Settings | ✅ | ❌ | ❌ |

- **🚦 Access Governance**: New users are locked in a "Pending" state, requiring explicit Admin verification.
- **🕵️ Least-Privilege Enforcement**: Sensitive actions (deleting sales, editing prices) are hidden from unauthorized roles.

---

## 📶 Technical Resilience
*Designed to work even when the internet doesn't.*

- **📱 Progressive Web App (PWA)**: Desktop-class performance with mobile portability. Installable on Windows, Android, and iOS.
- **🔌 Offline Continuity**: Robust session persistence and Firestore IndexedDB caching allow full operations without connectivity.
- **🔄 Auto-Sync**: Data synchronization occurs automatically in the background once internet is restored.
- **🛰️ Live Status**: Integrated "Online/Offline" indicator for real-time user awareness.

---

## 🛠️ System Utilities
*Tools for scaling and maintaining the system.*

- **📥 Data Portability**: Bulk-import products and customers via CSV to speed up initial deployment.
- **💾 Cloud Backup**: Export the entire database (Sales, Customers, Products) to JSON for local archiving.
- **🎨 Fluid Design**: A unified UI that adapts seamlessly from ultra-wide monitors to handheld smartphones.
- **📖 Knowledge Base**: Built-in documentation and support links directly accessible from the Sidebar.

---

> [!TIP]
> **GPOS** is designed for high-frequency retail environments. For technical support or feature requests, please consult the internal [Documentation](file:///c:/Users/TechPeer/gpos/src/pages/settings/Documentation.jsx).
