# The Dare Gambit

A real-time game show management system for running dare-based tournament games with live buzzer support, team management, and synchronized displays.

## 🏗️ Project Structure

```
the-dare-gambit/
├── frontend/          # React + Vite + TypeScript client
├── server/            # Node.js (Fastify) server with Socket.IO
├── backend/           # (Legacy) Go server
└── .github/workflows/ # CI/CD deployment
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ (for frontend and backend)
- **Docker** (optional, for deployment)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5180`

### Backend (Node.js)

```bash
cd server
npm install
npm run dev
```

Backend runs at: `http://localhost:4000`

### 🐳 Docker Deployment

To run the full stack using Docker:

```bash
docker-compose up --build
```

This will start:

- Frontend at `http://localhost:80`
- Backend at `http://localhost:4000`

## 🎮 Features

- **Tournament Management** - Create tournaments, register teams, generate brackets
- **Real-time Game Control** - GM control panel with live synchronization
- **Buzzer System** - Interactive buzzer for team competitions
- **Live Display** - Big screen interface for audience viewing
- **Question Bank** - Manage dare cards and categories

## 📱 Routes

| Route         | Description                         |
| ------------- | ----------------------------------- |
| `/setup`      | Tournament setup wizard             |
| `/gm`         | Game Master control panel           |
| `/display`    | Big screen display for audience     |
| `/play`       | Player buzzer interface             |
| `/tournament` | Public tournament bracket           |
| `/admin`      | Admin panel for question management |

## 🛠️ Tech Stack

| Layer      | Technology                                       |
| ---------- | ------------------------------------------------ |
| Frontend   | React 19, Vite 7, TypeScript, MUI 7              |
| Backend    | Go 1.23, Socket.IO, Firestore                    |
| Routing    | TanStack Router                                  |
| State      | TanStack Query, Context API                      |
| Deployment | Firebase Hosting (frontend), Cloud Run (backend) |

## 🚢 Deployment

### Frontend (Firebase Hosting)

The frontend automatically deploys to Firebase Hosting on push to `main` via GitHub Actions.

### Backend (Cloud Run)

Build and deploy the Docker container:

```bash
cd backend
docker build -t the-dare-gambit-server .
# Deploy to Cloud Run
```

## 📄 License

MIT License
