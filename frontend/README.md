# Game Show System

A real-time Game Show management system built with React, Vite, TypeScript, Node.js, and Socket.IO.

## 🚀 Features

### 1. Tournament Management (`/setup`)

- **Create Tournament**: Set name and max teams.
- **Team Registration**: Add teams with names.
- **Bracket Generation**: Automatically pairs teams for matches.

### 2. Game Master (GM) Control Panel (`/gm`)

- **3-Column Layout**:
  - **Controls**: Timer (15s, 30s, Stop, +5s), Phase Actions (Correct/Wrong, Score).
  - **Live Preview**: See exactly what the players see.
  - **Status**: Real-time scores, logs, and match info.
- **Real-time Control**: Manage game phases (Buzzer, Category, Strategy, Action).

### 3. Player / Big Screen Interface (`/display`)

- **Synchronized State**: Updates instantly with GM actions.
- **Big Timer**: Large countdown timer for "Action" phases.
- **Scoreboard**: Always-visible scores.
- **Interactive Phases**: Visuals for Buzzer, Card Reveal, and Strategy Selection.

### 4. Public Bracket (`/tournament`)

- **Live Updates**: Shows the current state of the tournament.
- **Match Tracking**: Highlights active matches and winners.

---

## 🎮 How to Use (Step-by-Step)

### Prerequisites

- Node.js installed.
- Terminal open.

### Step 1: Start the System

Run the development servers for both client and server:

```bash
npm run dev:all
```

_Or run them separately:_

- Client: `npm run dev` (http://localhost:5180)
- Server: `npm run dev:server` (http://localhost:4000)

### Step 2: Setup Tournament

1.  Open **http://localhost:5180/setup** in your browser.
2.  **Step 1**: Enter a Tournament Name (e.g., "Grand Championship") and Max Teams (e.g., 8). Click "Create".
3.  **Step 2**: Register Teams. Enter team names (e.g., "Red Dragons", "Blue Knights") and click "Add Team".
4.  **Step 3**: Click "Go to Bracket" to finish setup.

### Step 3: Start the Game (GM)

1.  Open **http://localhost:5180/gm** in a new tab (or on a tablet/laptop for the GM).
2.  You will see the **GM Control Panel**.
3.  Click **"Start Match"** to begin the first match.

### Step 4: Setup Player Screen

1.  Open **http://localhost:5180/display** in a separate window (move this to the projector/TV).
2.  This screen will automatically show the current match status, scores, and timer.

### Step 5: Play the Game!

Follow the game flow using the GM Panel:

1.  **Buzzer Phase**:

    - The system starts in "Buzzer" mode.
    - (Simulation) Open a new tab to `http://localhost:5180/play` to act as a player and click "Buzz", OR wait for physical buzzer integration.
    - **GM**: You will see who buzzed. Click **"Correct"** or **"Wrong"**.

2.  **Category & Strategy**:

    - The flow moves to Category/Strategy selection.
    - Follow the on-screen prompts.

3.  **Action Phase (Timer)**:

    - When the challenge starts, use the **Timer Controls** on the left.
    - Click **"15s"** or **"30s"**.
    - Watch the timer count down on both the GM and Player screens.
    - Use **"+5 Sec"** if needed.

4.  **Scoring**:
    - Click **"Success (+Points)"** to award points and end the round.
    - The game loops back to the Buzzer phase.

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Material UI (MUI), TanStack Router.
- **Backend**: Node.js (Fastify), Socket.IO.
- **State**: Zustand (Client), In-Memory GameManager (Server).

---

## 📚 API Documentation

The backend API is built with Fastify and supports the following endpoints. For detailed OpenAPI specification, see [`server/swagger/openapi.yaml`](server/swagger/openapi.yaml).

### Authentication

- **POST /login**  
  Body: `{ username, password }`  
  Response: `{ token }`
  - Demo user: username `admin`, password `password`.

### Tournaments

- **POST /tournaments** (Auth required)  
  Body: `{ name }`  
  Response: Tournament object.
- **GET /tournaments**  
  Response: Array of Tournament objects.
- **GET /tournaments/:id**  
  Response: Tournament object or 404.

Auth uses JWT: Include `Authorization: Bearer <token>` in headers.

### Swagger UI

When the server is running, visit `http://localhost:4000/docs` to view the interactive API documentation.

---

## 🛠️ Development Setup

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd game-show
   ```

2. Install dependencies for both client and server:

   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `server/.env.example` to `server/.env`
   - Update values as needed (e.g., JWT secret).

### Running the Application

- Start both client and server:

  ```bash
  npm run dev:all
  ```

  - Client: http://localhost:5180
  - Server: http://localhost:4000

- Or run separately:
  - Client: `npm run dev`
  - Server: `npm run dev:server`

### Building for Production

```bash
npm run build
npm run preview  # Preview the built client
```

For server:

```bash
cd server
npm run build
npm start
```

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit changes: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Open a Pull Request.

### Code Style

- Use ESLint and Prettier for code formatting.
- Run `npm run lint` before committing.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📝 Notes

- In-memory storage is used for demo purposes. Consider integrating a database (e.g., PostgreSQL) for production.
- Replace static seed user with proper user registration.
- For physical buzzer integration, connect to hardware via GPIO or serial ports.
