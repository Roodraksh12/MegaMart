# MegaMart — Frontend

React 19 + Vite frontend for the MegaMart grocery delivery platform.

## Quick Start

```bash
npm install
cp .env.example .env   # fill in your values
npm run dev            # http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Environment Variables

Create a `.env` file in this directory:

```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_RAZORPAY_KEY_ID=
```

## Tech Stack

- **React 19** + **Vite 6**
- **Tailwind CSS 3**
- **Framer Motion** — animations
- **Zustand** — global state
- **React Router v7** — routing
- **Firebase** — authentication

See the [root README](../README.md) for full project documentation.
