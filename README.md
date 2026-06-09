# Visitor Management System

A full-stack visitor management platform for registering guests, managing staff accounts, and maintaining security occurrence book entries. Built as a **Turborepo monorepo** with an Express API, Expo mobile app, and shared packages.

## Features

- **Visitor registration** — ticket generation, SMS notifications, check-in/check-out, returning visitor tracking
- **Role-based access** — security, reception, admin, security admin, IT admin, and super admin roles
- **User management** — self-registration with admin approval, user CRUD for privileged roles
- **Occurrence book** — site-based entry numbering, guard logs, admin sign-off
- **Real-time updates** — Socket.IO events for visitor activity
- **API documentation** — Swagger UI (REST) and GraphQL (Apollo Server) with full endpoint coverage
- **Mobile app** — React Native (Expo) client using Apollo Client for GraphQL

## Monorepo structure

```
visitor-system/
├── apps/
│   ├── api/                    # Express backend (@visitor-system/api)
│   │   ├── src/
│   │   │   ├── controllers/    # Business logic (auth, users, visitors, occurrenceBook)
│   │   │   ├── routes/           # Thin route definitions
│   │   │   ├── middleware/       # Auth, validation, role checks, rate limiting
│   │   │   ├── graphql/          # GraphQL schema and resolvers
│   │   │   ├── docs/             # OpenAPI spec and Swagger UI
│   │   │   ├── models/           # Mongoose models
│   │   │   ├── validators/       # Zod schemas
│   │   │   └── utils/
│   │   └── server.js
│   └── mobile/                 # Expo app (@visitor-system/mobile)
│       ├── screens/
│       ├── services/             # GraphQL client and API wrappers
│       └── hooks/
├── packages/
│   └── types/                  # Shared TypeScript types
├── turbo.json
└── package.json                # Root workspace
```

## Prerequisites

- **Node.js** 18+
- **npm** 10+
- **MongoDB** (local or Atlas)
- **Expo Go** or an Android/iOS emulator (for mobile development)

## Getting started

### 1. Install dependencies

From the repository root:

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file at the repo root (or in `apps/api/`):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/visitor-system
JWT_SECRET=your_long_random_secret
NODE_ENV=development
CORS_ORIGIN=*

# Optional — SMS via Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Optional — password reset emails
EMAIL_USER=
EMAIL_PASS=
```

### 3. Point the mobile app at your API

Edit `apps/mobile/services/config.js` and set `API_HOST` to your machine's LAN IP when testing on a physical device:

```js
export const API_HOST = 'http://192.168.1.55:5000';
```

### 4. Run the project

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API and mobile in parallel |
| `npm run dev:api` | API only (nodemon) |
| `npm run dev:mobile` | Mobile only (Expo) |
| `npm run start:api` | Production API server |

## API documentation

Once the API is running (default port **5000**):

| Resource | URL |
|----------|-----|
| **Swagger UI** (REST) | http://localhost:5000/api/docs |
| **OpenAPI JSON** | http://localhost:5000/api/docs/openapi.json |
| **GraphQL** | http://localhost:5000/graphql |

Protected endpoints require the `x-auth-token` header with a JWT access token from `POST /api/auth/login` (or the `login` GraphQL mutation).

### REST endpoints

| Group | Base path | Auth |
|-------|-----------|------|
| Auth | `/api/auth` | Public (except logout-all) |
| Users | `/api/users` | Required |
| Visitors | `/api/visitors` | Required + role checks |
| Occurrence book | `/api/occurrence-book` | Required |

### GraphQL

The mobile app communicates via GraphQL. Resolvers delegate to the same controllers as the REST API, so behaviour is consistent across both interfaces.

## Architecture (API)

The backend follows a layered structure:

- **Routes** — HTTP method and path wiring only
- **Controllers** — business logic, split into small focused files
- **Middleware** — JWT auth (`x-auth-token`), Zod validation, role checks, rate limiting
- **Models** — Mongoose schemas for User, Visitor, ActivityLog, OccurrenceBook, etc.

### User roles

| Role | Typical access |
|------|----------------|
| `security` | Register visitors, occurrence book |
| `reception` | Look up visitors by ticket, today's list |
| `admin` | User management, visitor oversight, reports |
| `security_admin` | Admin-level access with restricted user visibility |
| `it_admin` | Full system administration |
| `pending` | Awaiting admin approval after self-registration |

## Mobile app

The Expo app (`apps/mobile`) uses **Apollo Client** for all API calls. Service functions in `services/api.js` keep the same signatures as the original REST client, so screens and hooks work without changes.

Key screens:

- **Login / Sign up** — authentication and self-registration
- **Security** — visitor registration and check-out
- **Reception** — ticket lookup
- **Admin** — user management, visitor reports, activity logs, occurrence book sign-off

## Tech stack

| Layer | Technologies |
|-------|--------------|
| Monorepo | Turborepo, npm workspaces |
| API | Express, Mongoose, Socket.IO, Zod, Apollo Server, Swagger UI |
| Mobile | React Native, Expo, Apollo Client, Zustand, React Navigation |
| Auth | JWT access + refresh tokens, bcrypt |

## License

Private — not for public distribution.
