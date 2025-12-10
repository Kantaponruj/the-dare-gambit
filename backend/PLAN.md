# Backend Migration to Golang

## Goal Description

Migrate the existing Node.js (Fastify + Socket.IO) backend to Golang to improve performance, concurrency handling, and type safety. The new backend will reside in a `server-go` directory.

## User Review Required

> [!IMPORTANT] > **Go Installation:** The `go` command is not detected. You will need to install Go to run the new server.
> **Socket.IO Compatibility:** The current frontend uses Socket.IO v4. I will use `github.com/zishang520/socket.io` which supports v4.

## Proposed Changes

### Directory Structure

I will create a new directory `server-go` with the following structure:

```
server-go/
├── cmd/
│   └── server/
│       └── main.go       # Entry point
├── internal/
│   ├── domain/           # Core types (Team, Match, Tournament)
│   ├── game/             # Game logic (GameManager)
│   ├── cards/            # Card service
│   └── socket/           # Socket.IO handlers
├── go.mod
└── go.sum
```

### Dependencies

- `github.com/zishang520/socket.io`: For Socket.IO v4 support.
- `github.com/google/uuid`: For generating IDs.
- `github.com/joho/godotenv`: For .env support.

### Migration Steps

#### 1. Setup & Core Types

- Initialize `go mod` (manually since `go` is missing).
- Port `server/src/gameState.ts` types to Go structs in `internal/domain`.

#### 2. Card Service

- Port `server/src/services/cardService.ts` to `internal/cards`.
- Implement the hardcoded card data.

#### 3. Game Logic (The Heavy Lifting)

- Port `GameManager` class to a Go struct in `internal/game`.
- **Concurrency:** Add `sync.RWMutex` to `GameManager` to safely handle concurrent access.
- Implement Timer logic using `time.Ticker`.

#### 4. Socket Server

- Implement `main.go` to start the server.
- Wire up Socket.IO events to `GameManager` methods in `internal/socket`.
