# Game Show API (Fastify)

Minimal Node.js Fastify API to support login and tournament creation inside the monorepo.

## Endpoints

- POST /login { username, password } -> { token }
  - Demo user seeded: username `admin`, password `password`.
- POST /tournaments (auth required) { name } -> Tournament
- GET /tournaments -> Tournament[]
- GET /tournaments/:id -> Tournament | 404

Auth uses JWT (Authorization: Bearer <token>).

## Development

```bash
cp server/.env.example server/.env
npm install
npm run dev:server
```

Front-end dev concurrently:

```bash
npm run dev:all
```

## Notes

- In-memory storage only for demo.
- Replace with a real database (e.g. Postgres) later.
- Replace static seed user creation with proper user registration flow.
