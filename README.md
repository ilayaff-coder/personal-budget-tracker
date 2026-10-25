# Personal Budget Tracker

A React and Express personal finance app backed exclusively by MongoDB through Mongoose. It shows only records stored in MongoDB. An empty database produces zero dashboard totals, empty transaction and budget lists, and an empty reports state. When MongoDB is disconnected, the API returns an error and the UI reports the connection problem.

## Project structure

```text
Personal Budget Tracker/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── pages/
│   │   │   └── AuthPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   └── styles.css
│   └── package.json
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── budgetController.js
│   │   ├── dbGuard.js
│   │   ├── requireAuth.js
│   │   ├── summaryController.js
│   │   └── transactionController.js
│   ├── models/
│   │   ├── Budget.js
│   │   ├── Transaction.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── budgetRoutes.js
│   │   └── transactionRoutes.js
│   ├── server.js
│   └── .env
└── README.md
```

## Requirements and configuration

- Node.js 18+ and npm
- A running MongoDB server (local MongoDB or MongoDB Atlas)

Copy `backend/.env.example` to `backend/.env`, then set a private random `JWT_SECRET`. The example uses a local MongoDB server:

```env
MONGO_URI=mongodb://127.0.0.1:27017/personal-budget-tracker
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=replace-with-a-long-random-secret
```

For Atlas, replace `MONGO_URI` with your connection string. Keep secrets in `backend/.env`; it is ignored by Git. If using a local MongoDB installation without its service already running, start `mongod` with a writable database directory, for example:

```powershell
New-Item -ItemType Directory -Force backend\data
mongod --dbpath backend\data --bind_ip 127.0.0.1 --port 27017
```

## Install and run

From the project root:

```bash
npm install
npm run install:all
npm run dev
```

Open [http://localhost:5173/dashboard](http://localhost:5173/dashboard). The API is at [http://localhost:5000/api](http://localhost:5000/api). The backend prints `MongoDB connected successfully` after it connects. `/api/health` reports the live connection status.

To run each service separately, use `npm run dev --prefix backend` and `npm run dev --prefix frontend` in separate terminals. To point the frontend at another API, create `frontend/.env` with `VITE_API_URL=http://localhost:5000/api`.

## Frontend pages

- `/dashboard`
- `/transactions`
- `/add-transaction`
- `/budget`
- `/reports`
- `/sign-in`
- `/sign-up`

## REST API

All data routes require an active MongoDB connection. If MongoDB is unavailable, they return HTTP 503 with a readable error.

Sign-up and sign-in use `/api/auth/register` and `/api/auth/login`. Passwords are hashed with bcrypt, and successful authentication returns a short-lived JWT. Pass it as a Bearer token for the current-user and financial APIs. Transaction and budget records are scoped to the signed-in user.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API and MongoDB connection status |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Read the authenticated account |
| GET / POST | `/api/transactions` | List (supports `search`, `type`, `month`) / create |
| GET / PUT / DELETE | `/api/transactions/:id` | Read one / update / delete |
| GET / POST | `/api/budgets` | List / create or set a month's budget |
| GET / PUT / DELETE | `/api/budgets/:id` | Read one / update / delete |
| GET | `/api/dashboard?month=YYYY-MM` | MongoDB totals and budget calculations for the selected month |
| GET | `/api/reports?month=YYYY-MM` | MongoDB income/expense totals, category aggregates and monthly spending |

Transactions store type, amount, category, description and date. Budgets store the selected `YYYY-MM` period, its year and amount. All displayed money is formatted as Indian Rupees.

## Data behavior

No records are inserted automatically. Dashboard totals and report aggregates are calculated from MongoDB. A missing budget is shown as “No budget set”; remaining budget is zero until one is configured. Temporary verification data should be removed after testing.
