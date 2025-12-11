package socket

import (
	"encoding/json"
	"fmt"
	"log"

	"the-dare-gambit-server/internal/domain"
	"the-dare-gambit-server/internal/game"

	socketio "github.com/zishang520/socket.io/socket"
)

type Handler struct {
	gameManager *game.Manager
}

func NewHandler(gm *game.Manager) *Handler {
	return &Handler{
		gameManager: gm,
	}
}

func (h *Handler) RegisterEvents(io *socketio.Server) {
	io.On("connection", func(clients ...interface{}) {
		client := clients[0].(*socketio.Socket)
		log.Printf("Client connected: %s", client.Id())

		// Send initial state
		client.Emit("tournament:state", h.gameManager.GetTournament())
		client.Emit("match:state", h.gameManager.GetCurrentMatch())

		client.On("tournament:get_state", func(data ...interface{}) {
			client.Emit("tournament:state", h.gameManager.GetTournament())
		})

		client.On("match:get_state", func(data ...interface{}) {
			client.Emit("match:state", h.gameManager.GetCurrentMatch())
		})

		// --- Tournament Events ---
		client.On("tournament:create", func(data ...interface{}) {
			payload := data[0].(map[string]interface{})
			name := payload["name"].(string)
			maxTeams := int(payload["maxTeams"].(float64))
			
			defaultRounds := 10
			if val, ok := payload["defaultRoundsPerGame"]; ok && val != nil {
				defaultRounds = int(val.(float64))
			}
			
			buzzerEnabled := true
			if val, ok := payload["buzzerEnabled"]; ok && val != nil {
				buzzerEnabled = val.(bool)
			}

			tournament := h.gameManager.CreateTournament(name, maxTeams, defaultRounds, buzzerEnabled)
			io.Emit("tournament:state", tournament)
			log.Printf("Tournament created: %s", name)
		})

		client.On("tournament:update", func(data ...interface{}) {
			payload := data[0].(map[string]interface{})
			name := payload["name"].(string)
			maxTeams := int(payload["maxTeams"].(float64))

			tournament, err := h.gameManager.UpdateTournament(name, maxTeams)
			if err != nil {
				client.Emit("error", err.Error())
				return
			}
			io.Emit("tournament:state", tournament)
		})

		client.On("team:register", func(data ...interface{}) {
			payload := data[0].(map[string]interface{})
			name := payload["name"].(string)
			color := payload["color"].(string)
			image := ""
			if val, ok := payload["image"]; ok && val != nil {
				image = val.(string)
			}

			_, err := h.gameManager.RegisterTeam(name, color, image)
			if err != nil {
				client.Emit("error", err.Error())
				return
			}
			client.Emit("tournament:state", h.gameManager.GetTournament())
			io.Emit("tournament:state", h.gameManager.GetTournament())
		})

		client.On("team:update", func(data ...interface{}) {
			payload := data[0].(map[string]interface{})
			teamID := payload["teamId"].(string)
			name := payload["name"].(string)

			_, err := h.gameManager.UpdateTeam(teamID, name)
			if err != nil {
				client.Emit("error", err.Error())
				return
			}
			client.Emit("tournament:state", h.gameManager.GetTournament())
			io.Emit("tournament:state", h.gameManager.GetTournament())
		})

		client.On("team:delete", func(data ...interface{}) {
			payload := data[0].(map[string]interface{})
			teamID := payload["teamId"].(string)

			_, err := h.gameManager.DeleteTeam(teamID)
			if err != nil {
				client.Emit("error", err.Error())
				return
			}
			client.Emit("tournament:state", h.gameManager.GetTournament())
			io.Emit("tournament:state", h.gameManager.GetTournament())
		})

		client.On("team:add_member", func(data ...interface{}) {
			payload := data[0].(map[string]interface{})
			teamID := payload["teamId"].(string)
			memberName := payload["memberName"].(string)
			role := ""
			if val, ok := payload["role"]; ok && val != nil {
				role = val.(string)
			}

			_, err := h.gameManager.AddTeamMember(teamID, memberName, role)
			if err != nil {
				client.Emit("error", err.Error())
				return
			}
			client.Emit("tournament:state", h.gameManager.GetTournament())
			io.Emit("tournament:state", h.gameManager.GetTournament())
		})

		client.On("team:update_member", func(data ...interface{}) {
			payload := data[0].(map[string]interface{})
			teamID := payload["teamId"].(string)
			memberID := payload["memberId"].(string)
			name := payload["name"].(string)
			role := ""
			if val, ok := payload["role"]; ok && val != nil {
				role = val.(string)
			}

			_, err := h.gameManager.UpdateTeamMember(teamID, memberID, name, role)
			if err != nil {
				client.Emit("error", err.Error())
				return
			}
			client.Emit("tournament:state", h.gameManager.GetTournament())
			io.Emit("tournament:state", h.gameManager.GetTournament())
		})

		client.On("team:remove_member", func(data ...interface{}) {
			payload := data[0].(map[string]interface{})
			teamID := payload["teamId"].(string)
			memberID := payload["memberId"].(string)

			_, err := h.gameManager.RemoveTeamMember(teamID, memberID)
			if err != nil {
				client.Emit("error", err.Error())
				return
			}
			client.Emit("tournament:state", h.gameManager.GetTournament())
			io.Emit("tournament:state", h.gameManager.GetTournament())
		})

		client.On("team:update_color", func(data ...interface{}) {
			payload := data[0].(map[string]interface{})
			teamID := payload["teamId"].(string)
			color := payload["color"].(string)

			_, err := h.gameManager.UpdateTeamColor(teamID, color)
			if err != nil {
				client.Emit("error", err.Error())
				return
			}
			io.Emit("tournament:state", h.gameManager.GetTournament())
		})

		client.On("team:update_image", func(data ...interface{}) {
			payload := data[0].(map[string]interface{})
			teamID := payload["teamId"].(string)
			image := payload["image"].(string)

			_, err := h.gameManager.UpdateTeamImage(teamID, image)
			if err != nil {
				client.Emit("error", err.Error())
				return
			}
			io.Emit("tournament:state", h.gameManager.GetTournament())
		})

		client.On("tournament:update_settings", func(data ...interface{}) {
			payload := data[0].(map[string]interface{})
			minTeams := int(payload["minTeams"].(float64))
			minMembers := int(payload["minMembersPerTeam"].(float64))
			
			var defaultRounds *int
			if val, ok := payload["defaultRoundsPerGame"]; ok && val != nil {
				r := int(val.(float64))
				defaultRounds = &r
			}
			
			var buzzerEnabled *bool
			if val, ok := payload["buzzerEnabled"]; ok && val != nil {
				b := val.(bool)
				buzzerEnabled = &b
			}

			_, err := h.gameManager.UpdateTournamentSettings(minTeams, minMembers, defaultRounds, buzzerEnabled)
			if err != nil {
				client.Emit("error", err.Error())
				return
			}
			io.Emit("tournament:state", h.gameManager.GetTournament())
		})

		client.On("tournament:randomize", func(data ...interface{}) {
			defer func() {
				if r := recover(); r != nil {
					log.Printf("PANIC in tournament:randomize: %v", r)
					client.Emit("error", fmt.Sprintf("Server Panic: %v", r))
				}
			}()

			if len(data) == 0 {
				client.Emit("error", "No data received")
				return
			}
			payload, ok := data[0].(map[string]interface{})
			if !ok {
				client.Emit("error", "Invalid payload format")
				return
			}
			
			// Handle names array
			var names []string
			if val, ok := payload["names"]; ok && val != nil {
				if namesInterface, ok := val.([]interface{}); ok {
					names = make([]string, 0, len(namesInterface))
					for _, name := range namesInterface {
						if str, ok := name.(string); ok {
							names = append(names, str)
						}
					}
				}
			}

			tournament, _, err := h.gameManager.RandomizeTeams(names)
			if err != nil {
				client.Emit("error", err.Error())
				return
			}
			
			// Broadcast to everyone
			io.Emit("tournament:state", tournament)
		})

		client.On("tournament:set_teams", func(data ...interface{}) {
			if len(data) == 0 {
				return
			}

			// Use JSON roundtrip to safely decode the complex Team structure
			type SetTeamsPayload struct {
				Teams []domain.Team `json:"teams"`
			}

			jsonData, err := json.Marshal(data[0])
			if err != nil {
				log.Printf("ERROR: Failed to marshal set_teams payload: %v", err)
				return
			}

			var payload SetTeamsPayload
			if err := json.Unmarshal(jsonData, &payload); err != nil {
				log.Printf("ERROR: Failed to unmarshal set_teams payload: %v", err)
				return
			}

			log.Printf("Setting %d teams from client", len(payload.Teams))
			tournament, err := h.gameManager.SetTeams(payload.Teams)
			if err != nil {
				log.Printf("ERROR: SetTeams failed: %v", err)
				client.Emit("error", err.Error())
				return
			}

			// Broadcast to everyone
			io.Emit("tournament:state", tournament)

			// Acknowledge to originating client that teams were set
			client.Emit("tournament:set_teams:ack", map[string]interface{}{
				"success":    true,
				"teamsCount": len(payload.Teams),
			})
		})

		client.On("tournament:validate", func(data ...interface{}) {
			validation := h.gameManager.ValidateTournamentStart()
			client.Emit("tournament:validation", validation)
		})

		client.On("tournament:start", func(data ...interface{}) {
			_, err := h.gameManager.StartTournament()
			if err != nil {
				client.Emit("error", err.Error())
				return
			}
			io.Emit("tournament:state", h.gameManager.GetTournament())
			io.Emit("match:state", h.gameManager.GetCurrentMatch())
		})

		client.On("tournament:end", func(data ...interface{}) {
			tournament, err := h.gameManager.EndTournament()
			if err != nil {
				client.Emit("error", err.Error())
				return
			}
			io.Emit("tournament:state", tournament)
			io.Emit("match:state", h.gameManager.GetCurrentMatch())
		})

		// --- Match Events ---
		client.On("game:check_code", func(data ...interface{}) {
			payload := data[0].(map[string]interface{})
			code := payload["code"].(string)
			
			match := h.gameManager.GetCurrentMatch()
			if match == nil {
				client.Emit("game:code_result", map[string]interface{}{
					"success": false,
					"error":   "No active match found",
				})
				return
			}

			if match.GameCode == code {
				client.Emit("game:code_result", map[string]interface{}{"success": true})
				client.Emit("match:state", match)
			} else {
				client.Emit("game:code_result", map[string]interface{}{
					"success": false,
					"error":   "Invalid game code",
				})
			}
		})

		client.On("match:start", func(data ...interface{}) {
			log.Printf("Client %s requested match:start", client.Id())
			match := h.gameManager.StartMatch()
			if match == nil {
				log.Printf("match:start: no current match to start for client %s", client.Id())
			} else {
				log.Printf("match:start: started match %s", match.ID)
			}
			io.Emit("match:state", match)
		})

		client.On("match:update_rounds", func(data ...interface{}) {
			payload := data[0].(map[string]interface{})
			rounds := int(payload["rounds"].(float64))
			match := h.gameManager.UpdateMatchRounds(rounds)
			io.Emit("match:state", match)
		})

		client.On("match:end", func(data ...interface{}) {
			match := h.gameManager.EndMatchCurrent()
			io.Emit("match:state", match)
			io.Emit("tournament:state", h.gameManager.GetTournament())
		})

		client.On("tournament:next_match", func(data ...interface{}) {
			nextMatch, err := h.gameManager.NextMatch()
			if err != nil {
				client.Emit("error", err.Error())
				return
			}
			io.Emit("tournament:state", h.gameManager.GetTournament())
			io.Emit("match:state", nextMatch)
		})

		client.On("game:buzzer", func(data ...interface{}) {
			payload := data[0].(map[string]interface{})
			teamID := payload["teamId"].(string)
			match := h.gameManager.HandleBuzzer(teamID)
			if match != nil {
				io.Emit("match:state", match)
			}
		})

		client.On("game:judge_buzzer", func(data ...interface{}) {
			payload := data[0].(map[string]interface{})
			var winnerTeamID string
			if val, ok := payload["winnerTeamId"]; ok && val != nil {
				winnerTeamID = val.(string)
			}
			match := h.gameManager.JudgeBuzzer(winnerTeamID)
			io.Emit("match:state", match)
		})

		client.On("game:select_option", func(data ...interface{}) {
			payload := data[0].(map[string]interface{})
			category := payload["category"].(string)
			difficulty := payload["difficulty"].(string)
			
			match := h.gameManager.SelectOption(domain.Option{
				Category:   category,
				Difficulty: difficulty,
			})
			io.Emit("match:state", match)
		})

		client.On("game:select_answer", func(data ...interface{}) {
			payload := data[0].(map[string]interface{})
			answer := payload["answer"].(string)
			match := h.gameManager.SelectAnswer(answer)
			io.Emit("match:state", match)
		})

		client.On("game:approve_answer", func(data ...interface{}) {
			payload := data[0].(map[string]interface{})
			approved := payload["approved"].(bool)
			match := h.gameManager.ApproveAnswer(approved)
			io.Emit("match:state", match)
		})

		client.On("game:select_strategy", func(data ...interface{}) {
			payload := data[0].(map[string]interface{})
			strategy := payload["strategy"].(string)
			match := h.gameManager.SelectStrategy(strategy)
			io.Emit("match:state", match)
		})

		client.On("game:confirm_reveal", func(data ...interface{}) {
			match := h.gameManager.ConfirmReveal()
			io.Emit("match:state", match)
		})

		client.On("game:score_action", func(data ...interface{}) {
			payload := data[0].(map[string]interface{})
			success := payload["success"].(bool)
			match := h.gameManager.ScoreAction(success)
			io.Emit("match:state", match)
		})

		client.On("game:next_round", func(data ...interface{}) {
			match := h.gameManager.NextRound()
			io.Emit("match:state", match)
		})

		// --- Timer Events ---
		client.On("timer:start", func(data ...interface{}) {
			payload := data[0].(map[string]interface{})
			duration := int(payload["duration"].(float64))
			match := h.gameManager.StartTimer(duration)
			io.Emit("match:state", match)
		})

		client.On("timer:stop", func(data ...interface{}) {
			match := h.gameManager.StopTimer()
			io.Emit("match:state", match)
		})

		client.On("timer:add", func(data ...interface{}) {
			payload := data[0].(map[string]interface{})
			seconds := int(payload["seconds"].(float64))
			match := h.gameManager.AddTime(seconds)
			io.Emit("match:state", match)
		})

		client.On("disconnect", func(data ...interface{}) {
			log.Printf("Client disconnected: %s", client.Id())
		})
	})
}
