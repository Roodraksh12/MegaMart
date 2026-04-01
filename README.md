<div align="center">

<h1>🛒 MegaMart</h1>

<p><strong>A full-stack grocery e-commerce platform built for speed and simplicity.</strong><br/>
Fresh groceries, artisanal bakery, and dairy — curated and delivered in 30 minutes.</p>

<p>
  <a href="https://supermart-blond.vercel.app/"><img src="https://img.shields.io/badge/Live%20Demo-supermart--blond.vercel.app-black?style=flat-square&logo=vercel&logoColor=white" alt="Live Demo"/></a>
  <a href="https://github.com/Roodraksh12/supermart/stargazers"><img src="https://img.shields.io/github/stars/Roodraksh12/supermart?style=flat-square&color=black" alt="Stars"/></a>
  <a href="https://github.com/Roodraksh12/supermart/issues"><img src="https://img.shields.io/github/issues/Roodraksh12/supermart?style=flat-square&color=black" alt="Issues"/></a>
  <img src="https://img.shields.io/badge/React-19-black?style=flat-square&logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/Node.js-Express-black?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-black?style=flat-square&logo=supabase&logoColor=white" alt="Supabase"/>
  <img src="https://img.shields.io/badge/Firebase-Auth-black?style=flat-square&logo=firebase&logoColor=white" alt="Firebase"/>
</p>

<br/>

</div>

---

## ✨ Features

| Customer Experience | Admin Controls |
|---|---|
| 🔍 Browse products by category | 📦 Add / edit / delete products |
| 🛒 Live cart with slide-out drawer | 📊 Bulk CSV product upload |
| 🔐 Firebase Google & Email auth | 💰 Configure delivery fees & thresholds |
| 💳 Razorpay payment integration | 🎟 Generate & manage promo codes |
| 📦 Real-time order tracking | 👤 Secure admin account management |
| 📱 Mobile-first responsive design | 🔑 Username + password admin login |
| 🔔 Toast notification system | 📋 Full order management dashboard |

---

## 🏗 Tech Stack

### Frontend
- **React 19** + **Vite** — fast, modern SPA
- **Tailwind CSS** — utility-first styling
- **Framer Motion** — smooth animations
- **Zustand** — lightweight state management
- **React Router v7** — client-side routing
- **Lucide React** — icon library
- **Firebase** — Google OAuth & email/password auth

### Backend
- **Node.js** + **Express 5** — REST API server
- **Supabase (PostgreSQL)** — cloud-hosted database
- **Firebase Admin SDK** — server-side token verification
- **JWT** — secure session tokens
- **bcryptjs** — password hashing
- **Razorpay** — payment gateway integration

### Deployment
- **Frontend** → [supermart-blond.vercel.app](https://supermart-blond.vercel.app/) (Vercel)
- **Backend** → [Render](https://render.com)
- **Database** → [Supabase](https://supabase.com)

---

## 📁 Project Structure

```
MegaMart/
├── frontend/                   # React + Vite app
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── AuthModal.jsx       # Login / sign-up modal
│   │   │   ├── CartDrawer.jsx      # Slide-out shopping cart
│   │   │   ├── Header.jsx          # Top navigation bar
│   │   │   ├── BottomNav.jsx       # Mobile bottom navigation
│   │   │   ├── ProductCard.jsx     # Product display card
│   │   │   ├── Footer.jsx          # Site footer
│   │   │   └── ToastContainer.jsx  # Notification toasts
│   │   ├── pages/              # Route-level page components
│   │   │   ├── Home.jsx            # Product listing & hero
│   │   │   ├── ProductDetail.jsx   # Single product view
│   │   │   ├── Checkout.jsx        # Cart → payment flow
│   │   │   ├── Orders.jsx          # Order history & tracking
│   │   │   ├── AdminDashboard.jsx  # Full admin portal
│   │   │   ├── PrivacyPolicy.jsx
│   │   │   └── RefundPolicy.jsx
│   │   ├── store/
│   │   │   └── useStore.js         # Zustand global state
│   │   ├── utils/
│   │   │   ├── firebase.js         # Firebase client config
│   │   │   └── cn.js               # Tailwind class merger
│   │   ├── data/
│   │   │   └── mockData.js         # Category definitions
│   │   ├── layouts/            # Shared layout wrappers
│   │   ├── App.jsx             # Router setup
│   │   └── main.jsx            # App entry point
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                    # Express REST API
│   ├── server.js               # Main server & all route handlers
│   ├── db.js                   # Supabase client initialization
│   ├── .env.example            # Required environment variables
│   ├── Procfile                # Heroku/Render process file
│   └── railway.toml            # Railway deployment config
│
├── database/                   # Database schema files
│   ├── schema.sql              # Core table definitions
│   └── supabase_schema.sql     # Full Supabase-specific schema
│
├── render.yaml                 # Render.com infrastructure-as-code
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A [Supabase](https://supabase.com) project
- A [Firebase](https://firebase.google.com) project (for auth)
- A [Razorpay](https://razorpay.com) account (for payments)

### 1. Clone the repository

```bash
git clone https://github.com/Roodraksh12/supermart.git
cd supermart
```

### 2. Set up the Backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in your `.env` with your credentials (see [Environment Variables](#-environment-variables) below).

```bash
npm start
# Backend running on http://localhost:5000
```

### 3. Set up the Frontend

```bash
cd frontend
npm install
```

Create a `frontend/.env` file:

```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

```bash
npm run dev
# Frontend running on http://localhost:5173
```

### 4. Set up the Database

Run the schema against your Supabase project via the SQL Editor:

```bash
# Open database/supabase_schema.sql in the Supabase SQL Editor and execute it
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default: `5000`) |
| `JWT_SECRET` | Secret key for signing JWTs |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (keep private!) |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase admin service account email |
| `FIREBASE_PRIVATE_KEY` | Firebase admin service account private key |
| `ADMIN_PASSWORD` | Initial admin panel password |
| `FRONTEND_URL` | Deployed frontend URL (for CORS) |

> ⚠️ **Never commit `.env` files or Firebase service account JSON files to version control.**

---

## 📡 API Overview

All API endpoints are prefixed with `/api`.

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/products` | Fetch all products | Public |
| `POST` | `/api/products` | Add a product | Admin |
| `PUT` | `/api/products/:id` | Update a product | Admin |
| `DELETE` | `/api/products/:id` | Delete a product | Admin |
| `POST` | `/api/products/bulk` | Bulk CSV product import | Admin |
| `POST` | `/api/orders` | Place an order | User |
| `GET` | `/api/orders` | Get user's orders | User |
| `GET` | `/api/admin/orders` | Get all orders | Admin |
| `POST` | `/api/admin/login` | Admin login | — |
| `POST` | `/api/payment/create-order` | Create Razorpay order | User |
| `POST` | `/api/payment/verify` | Verify Razorpay payment | User |
| `GET` | `/api/settings` | Get store settings | Public |
| `PUT` | `/api/settings` | Update store settings | Admin |
| `GET` | `/api/promo/validate` | Validate a promo code | User |

---

## ☁️ Deployment

### Frontend → Vercel

🌐 **Live:** [https://supermart-blond.vercel.app/](https://supermart-blond.vercel.app/)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Roodraksh12/supermart)

1. Import the repo into Vercel
2. Set **Root Directory** to `frontend`
3. Add all `VITE_*` environment variables in the Vercel dashboard
4. Deploy

### Backend → Render

The `render.yaml` file in the root configures the backend service automatically.

1. Connect the repo to [Render](https://render.com)
2. Select **"Use render.yaml"** when prompted
3. Fill in all environment variables in the Render dashboard
4. Deploy

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/Roodraksh12">Roodraksh12</a></p>
</div>
