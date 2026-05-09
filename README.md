# Knowledge Hub

Personal library to save, tag, search resources. One command to run everything.

## Structure

```
knowledge-hub/          ← root (Express API lives here)
├── .env                ← MongoDB URI + JWT secret (edit this)
├── package.json        ← ONE npm run dev starts everything
├── src/
│   ├── index.js        ← Express entry point
│   ├── models/         ← Mongoose schemas (User, Resource)
│   ├── routes/         ← auth.js, resources.js
│   └── middleware/     ← auth.js (JWT verify)
└── frontend/           ← Next.js app
    ├── package.json
    ├── next.config.js  ← proxies /api/* → localhost:4000
    └── src/
        ├── app/        ← layout, globals.css, page.tsx, dashboard/
        ├── components/ ← ResourceCard, ResourceModal
        ├── lib/        ← api.ts, auth-context.tsx
        └── types/      ← index.ts
```

## Setup (3 steps)

### 1. Edit `.env` — add your MongoDB password

```env
MONGO_URI=mongodb+srv://akhilmern7:YOUR_PASSWORD@cluster0.3dlpip5.mongodb.net/knowledge-hub?retryWrites=true&w=majority
JWT_SECRET=supersecret-change-me-in-production
PORT=4000
```

### 2. Install dependencies

```bash
npm run install:all
```

### 3. Run

```bash
npm run dev
```

Open http://localhost:3000

You will see in the terminal:
```
[API] ✅  MongoDB connected
[API] ✅  API running → http://localhost:4000
[WEB] ▲ Next.js ready on http://localhost:3000
```

## MongoDB Atlas — allow your IP

Atlas → Network Access → Add IP → Allow from Anywhere (0.0.0.0/0)

## API

| Method | Endpoint              | Auth? | Description           |
|--------|-----------------------|-------|-----------------------|
| POST   | /api/auth/signup      | No    | Register              |
| POST   | /api/auth/login       | No    | Login → JWT           |
| GET    | /api/resources        | Yes   | List (search, tags)   |
| POST   | /api/resources        | Yes   | Create                |
| PUT    | /api/resources/:id    | Yes   | Update                |
| DELETE | /api/resources/:id    | Yes   | Delete                |
| GET    | /api/health           | No    | DB health check       |

## MongoDB Collections

**users** — name, email, password (bcrypt), createdAt, updatedAt  
**resources** — user (ObjectId), title, url, description, tags[], createdAt, updatedAt
