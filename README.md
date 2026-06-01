# OpenSplit – Open Source Expense Sharing Platform

A free, privacy-friendly expense sharing app for students, roommates, friends, and trip groups. Split bills, track balances, and settle up  no ads, no paywalls.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT (JSON Web Tokens) |

## Features

- User registration and login
- Create groups and add members
- Add shared expenses (equal split)
- Automatic balance calculation
- Payment settlement tracking
- Expense history per group
- Dark mode + mobile responsive UI

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))

### Backend

```bash
cd backend
npm install
cp .env.example .env      # fill in your MONGO_URI and JWT_SECRET
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`, API at `http://localhost:5000`.

## Project Structure

```
opensplit/
├── backend/      # Express API
└── frontend/     # React (Vite) UI
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT — see [LICENSE](LICENSE).
