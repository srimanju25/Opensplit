# OpenSplit – Open Source Expense Sharing Platform

A free, privacy-friendly expense sharing app for students, roommates, friends, and trip groups. Split bills, track balances, and settle up — no ads, no paywalls.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| UI Library | MUI (Material Design) |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT (JSON Web Tokens) |

## Features

- User registration and login (bcrypt password hashing)
- Create groups and add members by email
- Add shared expenses with equal split
- Automatic balance calculation (greedy minimum-transaction algorithm)
- **Individual per-member settlement** — mark each person's share as paid separately
- Expense history per group with filters (All / Unsettled / Settled)
- **CSV export** — download expense history as a `.csv` file with one click
- **Built-in chatbot assistant** — ask questions like "who owes what?" or "what's pending?" with no API key needed (pure keyword-matching algorithm)
- Material Design UI with dark / light theme toggle
- Mobile responsive layout

## Screenshots

> Register → Create a group → Add members → Add expenses → Settle up

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))

### Backend

```bash
cd backend
npm install
cp .env.example .env      # fill in your MONGO_URI and JWT_SECRET
npm run dev               # starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev               # starts on http://localhost:5174
```

Open **http://localhost:5174** in your browser.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, returns JWT token |
| GET | `/api/groups` | List all groups for logged-in user |
| POST | `/api/groups` | Create a new group |
| POST | `/api/groups/:id/members` | Add member to group by email |
| GET | `/api/expenses/:groupId` | List expenses for a group |
| POST | `/api/expenses` | Add new expense |
| PATCH | `/api/expenses/:id/settle-member` | Mark one member's share as paid |
| GET | `/api/expenses/:groupId/balances` | Get computed settlement amounts |
| POST | `/api/chat/:groupId` | Ask the chatbot about group expenses |

## Project Structure

```
opensplit/
├── backend/
│   ├── models/         # Mongoose schemas (User, Group, Expense)
│   ├── routes/         # Express routes (auth, groups, expenses, chat)
│   ├── middleware/      # JWT auth guard
│   ├── utils/          # Balance calculator, micro-GPT algorithm
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/  # Navbar, FloatingChatbot
    │   ├── pages/       # Login, Register, Dashboard, GroupDetails, etc.
    │   ├── context/     # AuthContext (JWT + user state)
    │   ├── api/         # Axios instance with auth interceptor
    │   └── theme.js     # MUI theme (dark/light)
    └── index.html
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT — see [LICENSE](LICENSE).
