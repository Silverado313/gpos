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

## 📁 Project Structure

```
GPOS/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   └── charts/
│   ├── pages/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── pos/
│   │   ├── products/
│   │   ├── inventory/
│   │   ├── sales/
│   │   ├── customers/
│   │   ├── employees/
│   │   ├── reports/
│   │   └── settings/
│   ├── firebase/
│   ├── store/
│   ├── hooks/
│   ├── modules/
│   ├── utils/
│   ├── routes/
│   └── constants/
├── .env.example
├── firebase.json
└── README.md
```

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

Made with ❤️ for the open source community.

---

## ⭐ Support

If you find this project helpful, please give it a **star** on GitHub!

> Built on Firebase Free Tier — Free forever for small businesses.