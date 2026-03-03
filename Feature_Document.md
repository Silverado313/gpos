# GPOS Feature Documentation

**GPOS (General Point of Sale)** is a comprehensive, cloud-based retail management system designed for small to medium-sized businesses. It integrates sales, inventory, financials, and staff management into a single, unified interface.

---

## 1. Core POS & Sales Management
The heart of GPOS provides a fast, reliable, and feature-rich checkout experience.

- **Dynamic Cart Management**: Add products via search or categories, adjust quantities, and apply line-item or global discounts.
- **Flexible Payments**: Support for **Cash**, **Card**, and **Credit** (Customer Balances).
- **Tax Management**: Fully configurable tax labels and percentage rates with a one-click toggle in the POS.
- **Loyalty Program**: Auto-track customer points based on spend. One-click redemption during checkout.
- **Held Sales (Suspended Sales)**: Save a current cart to the cloud and retrieve it later to serve other customers in the queue.
- **Sales Returns**: Process returns for completed sales with automatic inventory restoration (Restricted to Admins/Managers).
- **Printable Receipts**: Professional, branded HTML/CSS receipts generated instantly after every sale.

---

## 2. Inventory & Product Management
Granular control over products and real-time stock tracking.

- **Centralized Product Catalog**: Manage pricing, cost prices, units, barcodes, and categories.
- **Live Inventory Sync**: Stocks are automatically deducted upon sale and restored upon return.
- **Automatic Adjustments**: Manual stock-in/stock-out shortcuts for quick corrections.
- **Multi-Category Support**: Organize products for faster discovery in POS and Reports.
- **Stock Valuation**: Real-time calculation of **Total Asset Value** and potential profit based on current stock levels.

---

## 3. Supplier & Purchase Order (PO) Management
Streamline your supply chain and restock operations.

- **Vendor Database**: Store supplier contact details and incoming stock history.
- **Manual PO Creation**: Build purchase orders, track their status (Pending/Received), and print order documents.
- **"Receive Order" Workflow**: One-click confirmation of incoming orders that automatically updates inventory levels.
- **PO CRUD**: Full ability to edit or delete pending orders to fix mistakes before they hit the books.

---

## 4. Accounts & Financial Intelligence
True business health tracking beyond simple revenue numbers.

- **Cash Flow Register**: Monitor everyday till movements (Cash In/Out) for non-sale events like "Buying Tea" or "Register Float".
- **Expense Tracking**: Categorized expense management (Rent, Salaries, Utilities) to track overhead.
- **P&L Summary**: A centralized dashboard showing:
    - **Total Revenue**: Gross intake.
    - **COGS (Cost of Goods Sold)**: The actual cost of items sold, captured at the time of sale.
    - **Gross Profit**: Revenue minus COGS.
    - **True Net Profit**: Gross profit minus all expenses.
- **Register Reconciliation**: A shift-end workflow that compares "Expected Cash" (system) vs. "Actual Cash" (drawer) with over/short reporting.

---

## 5. Administration & Reporting
Data-driven insights for business owners.

- **Advanced Dashboard**: Real-time sales trends, growth comparisons (vs yesterday), and **Low Stock Alerts**.
- **Comprehensive Reports**: 
    - Sales composition (Cash vs Card vs Credit).
    - Top Selling Products by units and revenue.
    - Weekly revenue trends via interactive charts.
- **Export Capabilities**: Download reports to **CSV** or print professional **PDF** views for offline auditing.

---

## 6. Technical & Governance
Enterprise-grade security and reliability features.

- **Role-Based Access Control (RBAC)**:
    - **Admin**: Full access.
    - **Manager**: Management of products, inventory, and accounts.
    - **Cashier**: Restricted to POS, Customers, and basic Sales history.
- **Pending Approval Flow**: New registrations are locked into a "Pending" state until an Admin manually approves their role.
- **Offline Persistence (PWA)**:
    - **Installable**: Adds to desktop/home screen like a native app.
    - **Offline Sync**: Browse products and view data even without an internet connection using Firestore IndexedDB persistence.
    - **Service Workers**: Instant load times and offline asset caching.
- **UI Responsiveness**: Tailored layouts for Desktop, Tablet, and Mobile screens.
