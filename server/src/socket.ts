import { Server as SocketIOServer } from "socket.io";
import { FastifyInstance } from "fastify";
import { gameManager } from "./gameState.js";

export const setupSocket = (server: any) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*", // Allow all for dev
      methods: ["GET", "POST"],
    },
  });

  gameManager.setIO(io);

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Send initial state
    socket.emit("tournament:state", gameManager.getTournament());
    socket.emit("match:state", gameManager.getCurrentMatch());

    socket.on("tournament:get_state", () => {
      socket.emit("tournament:state", gameManager.getTournament());
    });

    socket.on("match:get_state", () => {
      socket.emit("match:state", gameManager.getCurrentMatch());
    });

    // --- Tournament Events ---
    socket.on(
      "tournament:create",
      ({ name, maxTeams, defaultRoundsPerGame, buzzerEnabled }) => {
        try {
          const tournament = gameManager.createTournament(
            name,
            maxTeams,
            defaultRoundsPerGame || 10, // Default to 10 if not provided
            buzzerEnabled !== undefined ? buzzerEnabled : true // Default to true if not provided
          );
          io.emit("tournament:state", tournament);
          console.log(`Tournament created: ${name}`);
        } catch (e: any) {
          socket.emit("error", e.message);
        }
      }
    );

    socket.on("tournament:update", ({ name, maxTeams }) => {
      try {
        gameManager.updateTournament(name, maxTeams);
        io.emit("tournament:state", gameManager.getTournament());
      } catch (e: any) {
        socket.emit("error", e.message);
      }
    });

    socket.on("team:register", ({ name, color, image }) => {
      try {
        gameManager.registerTeam(name, color, image);
        io.emit("tournament:state", gameManager.getTournament());
      } catch (e: any) {
        socket.emit("error", e.message);
      }
    });

    socket.on("team:update", ({ teamId, name }) => {
      try {
        gameManager.updateTeam(teamId, name);
        io.emit("tournament:state", gameManager.getTournament());
      } catch (e: any) {
        socket.emit("error", e.message);
      }
    });

    socket.on("team:delete", ({ teamId }) => {
      try {
        gameManager.deleteTeam(teamId);
        io.emit("tournament:state", gameManager.getTournament());
      } catch (e: any) {
        socket.emit("error", e.message);
      }
    });

    socket.on("team:add_member", ({ teamId, memberName, role }) => {
      try {
        gameManager.addTeamMember(teamId, memberName, role);
        io.emit("tournament:state", gameManager.getTournament());
      } catch (e: any) {
        socket.emit("error", e.message);
      }
    });

    socket.on("team:update_member", ({ teamId, memberId, name, role }) => {
      try {
        gameManager.updateTeamMember(teamId, memberId, name, role);
        io.emit("tournament:state", gameManager.getTournament());
      } catch (e: any) {
        socket.emit("error", e.message);
      }
    });

    socket.on("team:remove_member", ({ teamId, memberId }) => {
      try {
        gameManager.removeTeamMember(teamId, memberId);
        io.emit("tournament:state", gameManager.getTournament());
      } catch (e: any) {
        socket.emit("error", e.message);
      }
    });

    socket.on("team:update_color", ({ teamId, color }) => {
      try {
        gameManager.updateTeamColor(teamId, color);
        io.emit("tournament:state", gameManager.getTournament());
      } catch (e: any) {
        socket.emit("error", e.message);
      }
    });

    socket.on("team:update_image", ({ teamId, image }) => {
      try {
        gameManager.updateTeamImage(teamId, image);
        io.emit("tournament:state", gameManager.getTournament());
      } catch (e: any) {
        socket.emit("error", e.message);
      }
    });

    socket.on(
      "tournament:update_settings",
      ({
        minTeams,
        minMembersPerTeam,
        defaultRoundsPerGame,
        buzzerEnabled,
      }) => {
        try {
          gameManager.updateTournamentSettings(
            minTeams,
            minMembersPerTeam,
            defaultRoundsPerGame,
            buzzerEnabled
          );
          io.emit("tournament:state", gameManager.getTournament());
        } catch (e: any) {
          socket.emit("error", e.message);
        }
      }
    );

    socket.on("tournament:validate", () => {
      const validation = gameManager.validateTournamentStart();
      socket.emit("tournament:validation", validation);
    });

    socket.on("tournament:start", () => {
      try {
        gameManager.startTournament();
        io.emit("tournament:state", gameManager.getTournament());
        io.emit("match:state", gameManager.getCurrentMatch());
      } catch (e: any) {
        socket.emit("error", e.message);
      }
    });

    socket.on("tournament:next_match", () => {
      try {
        const match = gameManager.startNextMatch();
        if (match) {
          io.emit("tournament:state", gameManager.getTournament());
          io.emit("match:state", match);
        }
      } catch (e: any) {
        socket.emit("error", e.message);
      }
    });
    socket.on("tournament:end", () => {
      try {
        gameManager.endTournament();
        io.emit("tournament:state", gameManager.getTournament());
      } catch (e: any) {
        socket.emit("error", e.message);
      }
    });

    // --- Match Events ---
    socket.on("match:end", () => {
      const match = gameManager.getCurrentMatch();
      if (match) {
        gameManager.endMatch(match.id);
        io.emit("match:state", match);
      }
    });
    socket.on("game:check_code", ({ code }) => {
      const match = gameManager.getCurrentMatch();
      if (!match) {
        socket.emit("game:code_result", {
          success: false,
          error: "No active match found",
        });
        return;
      }

      if (match.gameCode === code) {
        socket.emit("game:code_result", { success: true });
        // Also send the match state now that they are verified
        socket.emit("match:state", match);
      } else {
        socket.emit("game:code_result", {
          success: false,
          error: "Invalid game code",
        });
      }
    });

    socket.on("match:start", () => {
      const match = gameManager.startMatch();
      io.emit("match:state", match);
    });

    socket.on("match:update_rounds", ({ rounds }) => {
      try {
        const match = gameManager.updateMatchRounds(rounds);
        io.emit("match:state", match);
      } catch (e: any) {
        socket.emit("error", e.message);
      }
    });

    socket.on("game:buzzer", ({ teamId }) => {
      const match = gameManager.handleBuzzer(teamId);
      if (match) io.emit("match:state", match);
    });

    socket.on("game:judge_buzzer", ({ winnerTeamId }) => {
      const match = gameManager.judgeBuzzer(winnerTeamId);
      io.emit("match:state", match);
    });

    socket.on("game:select_option", (option) => {
      try {
        const match = gameManager.selectOption(option);
        io.emit("match:state", match);
      } catch (e: any) {
        socket.emit("error", e.message);
      }
    });

    socket.on("game:select_answer", ({ answer }) => {
      const match = gameManager.selectAnswer(answer);
      io.emit("match:state", match);
    });

    socket.on("game:approve_answer", ({ approved }) => {
      const match = gameManager.approveAnswer(approved);
      io.emit("match:state", match);
    });

    socket.on("game:select_strategy", ({ strategy }) => {
      const match = gameManager.selectStrategy(strategy);
      io.emit("match:state", match);
    });

    socket.on("game:confirm_reveal", () => {
      const match = gameManager.confirmReveal();
      io.emit("match:state", match);
    });

    socket.on("game:score_action", ({ success }) => {
      const match = gameManager.scoreAction(success);
      io.emit("match:state", match);
    });

    socket.on("game:next_round", () => {
      const match = gameManager.nextRound();
      io.emit("match:state", match);
    });

    socket.on("tournament:randomize", ({ names }) => {
      try {
        gameManager.randomizeTeams(names);
        io.emit("tournament:state", gameManager.getTournament());
      } catch (e: any) {
        socket.emit("error", e.message);
      }
    });

    socket.on("tournament:set_teams", ({ teams }) => {
      try {
        gameManager.setTeams(teams);
        io.emit("tournament:state", gameManager.getTournament());
      } catch (e: any) {
        socket.emit("error", e.message);
      }
    });

    // --- Timer Events ---
    socket.on("timer:start", ({ duration }) => {
      const match = gameManager.startTimer(duration);
      io.emit("match:state", match);
    });

    socket.on("timer:stop", () => {
      const match = gameManager.stopTimer();
      io.emit("match:state", match);
    });

    socket.on("timer:add", ({ seconds }) => {
      const match = gameManager.addTime(seconds);
      io.emit("match:state", match);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};
