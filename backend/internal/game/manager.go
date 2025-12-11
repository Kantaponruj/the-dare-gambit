package game

import (
	"errors"
	"fmt"
	"log"
	"math"
	"math/rand"
	"strings"
	"sync"
	"time"

	"the-dare-gambit-server/internal/cards"
	"the-dare-gambit-server/internal/domain"

	"github.com/google/uuid"
	socketio "github.com/zishang520/socket.io/socket"
)

type Manager struct {
	tournament    *domain.Tournament
	cardService   *cards.Service
	timerTicker   *time.Ticker
	timerStopChan chan bool
	io            *socketio.Server
	mu            sync.RWMutex

	difficulties  []string
}

func NewManager(cardService *cards.Service) *Manager {
	return &Manager{
		cardService: cardService,
		difficulties: []string{"EASY", "MEDIUM", "HARD"},
	}
}

func (m *Manager) SetIO(io *socketio.Server) {
	m.io = io
}

func (m *Manager) GetCategories() []string {
	m.mu.RLock()
	defer m.mu.RUnlock()
	
	cats := m.cardService.GetCategories()
	names := make([]string, len(cats))
	for i, c := range cats {
		names[i] = c.Name
	}
	return names
}

func (m *Manager) AddCategory(category string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	return m.cardService.AddCategory(category)
}

func (m *Manager) UpdateCategory(oldName, newName string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.cardService.UpdateCategory(oldName, newName)
	return nil
}

func (m *Manager) DeleteCategory(category string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.cardService.DeleteByCategory(category)
	return nil
}

func (m *Manager) GetQuestions() []cards.GameCard {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.cardService.GetAll()
}

func (m *Manager) AddQuestion(text, category, answer string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	card := cards.GameCard{
		ID:            uuid.NewString(),
		Category:      category,
		Text:          text,
		Difficulty:    cards.DifficultyMedium, // Default
		Points:        100,                    // Default
		Type:          cards.TypeTruth,
		CorrectAnswer: answer,
		Answers:       []string{answer}, // Simple default
	}
	m.cardService.AddCard(card)
	return nil
}

func (m *Manager) DeleteQuestion(id string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.cardService.DeleteCard(id)
	return nil
}

func (m *Manager) getRandomOptions(count int) []domain.Option {
	options := []domain.Option{}
	
	// Shuffle categories
	cats := m.cardService.GetCategories()
	shuffledCats := make([]string, len(cats))
	for i, c := range cats {
		shuffledCats[i] = c.Name
	}
	
	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(shuffledCats), func(i, j int) {
		shuffledCats[i], shuffledCats[j] = shuffledCats[j], shuffledCats[i]
	})

	for i := 0; i < count; i++ {
		category := shuffledCats[i%len(shuffledCats)]
		difficulty := m.difficulties[rand.Intn(len(m.difficulties))]
		options = append(options, domain.Option{
			Category:   category,
			Difficulty: difficulty,
		})
	}
	return options
}

func (m *Manager) generateGameCode() string {
	rand.Seed(time.Now().UnixNano())
	return fmt.Sprintf("%06d", 100000+rand.Intn(900000))
}

// CreateTournament creates a new tournament
func (m *Manager) CreateTournament(name string, maxTeams int, defaultRoundsPerGame int, buzzerEnabled bool) *domain.Tournament {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.tournament = &domain.Tournament{
		ID:                   uuid.NewString(),
		Name:                 name,
		Teams:                []domain.Team{},
		Matches:              []*domain.Match{},
		CurrentMatchID:       "",
		Status:               domain.StatusRegistration,
		MaxTeams:             maxTeams,
		MinTeams:             2,
		MinMembersPerTeam:    1,
		DefaultQuestionTime:  30,
		DefaultDareTime:      60,
		DefaultRoundsPerGame: defaultRoundsPerGame,
		BuzzerEnabled:        buzzerEnabled,
		UsedCardIDs:          []string{}, // Track used cards to prevent duplicates in tournament
	}
	return m.tournament
}

func (m *Manager) GetTournament() *domain.Tournament {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.tournament
}

func (m *Manager) RegisterTeam(name string, color string, image string) (*domain.Team, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.tournament == nil {
		return nil, errors.New("no tournament created")
	}
	if len(m.tournament.Teams) >= m.tournament.MaxTeams {
		return nil, errors.New("tournament full")
	}

	for _, t := range m.tournament.Teams {
		if t.Color == color {
			return nil, errors.New("color already in use")
		}
	}

	team := domain.Team{
		ID:      uuid.NewString(),
		Name:    name,
		Score:   0,
		Members: []domain.TeamMember{},
		Color:   color,
		Image:   image,
	}
	m.tournament.Teams = append(m.tournament.Teams, team)
	return &team, nil
}

func (m *Manager) UpdateTournament(name string, maxTeams int) (*domain.Tournament, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.tournament == nil {
		return nil, errors.New("no tournament created")
	}

	if maxTeams < len(m.tournament.Teams) {
		return nil, fmt.Errorf("cannot reduce max teams below current team count (%d)", len(m.tournament.Teams))
	}

	m.tournament.Name = name
	m.tournament.MaxTeams = maxTeams
	return m.tournament, nil
}

// Team Management methods...
func (m *Manager) UpdateTeam(teamID string, name string) (*domain.Team, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.tournament == nil {
		return nil, errors.New("no tournament created")
	}

	for i := range m.tournament.Teams {
		if m.tournament.Teams[i].ID == teamID {
			m.tournament.Teams[i].Name = name
			return &m.tournament.Teams[i], nil
		}
	}
	return nil, errors.New("team not found")
}

func (m *Manager) DeleteTeam(teamID string) (*domain.Tournament, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.tournament == nil {
		return nil, errors.New("no tournament created")
	}

	for i, t := range m.tournament.Teams {
		if t.ID == teamID {
			m.tournament.Teams = append(m.tournament.Teams[:i], m.tournament.Teams[i+1:]...)
			return m.tournament, nil
		}
	}
	return nil, errors.New("team not found")
}

func (m *Manager) AddTeamMember(teamID string, memberName string, role string) (*domain.TeamMember, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.tournament == nil {
		return nil, errors.New("no tournament created")
	}

	for i := range m.tournament.Teams {
		if m.tournament.Teams[i].ID == teamID {
			member := domain.TeamMember{
				ID:   uuid.NewString(),
				Name: memberName,
				Role: role,
			}
			m.tournament.Teams[i].Members = append(m.tournament.Teams[i].Members, member)
			return &member, nil
		}
	}
	return nil, errors.New("team not found")
}

func (m *Manager) UpdateTeamMember(teamID string, memberID string, name string, role string) (*domain.TeamMember, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.tournament == nil {
		return nil, errors.New("no tournament created")
	}

	for i := range m.tournament.Teams {
		if m.tournament.Teams[i].ID == teamID {
			for j := range m.tournament.Teams[i].Members {
				if m.tournament.Teams[i].Members[j].ID == memberID {
					m.tournament.Teams[i].Members[j].Name = name
					if role != "" {
						m.tournament.Teams[i].Members[j].Role = role
					}
					return &m.tournament.Teams[i].Members[j], nil
				}
			}
			return nil, errors.New("member not found")
		}
	}
	return nil, errors.New("team not found")
}

func (m *Manager) RemoveTeamMember(teamID string, memberID string) (*domain.Team, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.tournament == nil {
		return nil, errors.New("no tournament created")
	}

	for i := range m.tournament.Teams {
		if m.tournament.Teams[i].ID == teamID {
			for j, member := range m.tournament.Teams[i].Members {
				if member.ID == memberID {
					m.tournament.Teams[i].Members = append(m.tournament.Teams[i].Members[:j], m.tournament.Teams[i].Members[j+1:]...)
					return &m.tournament.Teams[i], nil
				}
			}
			return nil, errors.New("member not found")
		}
	}
	return nil, errors.New("team not found")
}

func (m *Manager) UpdateTeamColor(teamID string, color string) (*domain.Team, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.tournament == nil {
		return nil, errors.New("no tournament created")
	}

	for _, t := range m.tournament.Teams {
		if t.ID != teamID && t.Color == color {
			return nil, errors.New("color already in use")
		}
	}

	for i := range m.tournament.Teams {
		if m.tournament.Teams[i].ID == teamID {
			m.tournament.Teams[i].Color = color
			return &m.tournament.Teams[i], nil
		}
	}
	return nil, errors.New("team not found")
}

func (m *Manager) UpdateTeamImage(teamID string, image string) (*domain.Team, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.tournament == nil {
		return nil, errors.New("no tournament created")
	}

	for i := range m.tournament.Teams {
		if m.tournament.Teams[i].ID == teamID {
			m.tournament.Teams[i].Image = image
			return &m.tournament.Teams[i], nil
		}
	}
	return nil, errors.New("team not found")
}

func (m *Manager) UpdateTournamentSettings(minTeams int, minMembersPerTeam int, defaultRoundsPerGame *int, buzzerEnabled *bool) (*domain.Tournament, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.tournament == nil {
		return nil, errors.New("no tournament created")
	}

	m.tournament.MinTeams = minTeams
	m.tournament.MinMembersPerTeam = minMembersPerTeam
	if defaultRoundsPerGame != nil {
		m.tournament.DefaultRoundsPerGame = *defaultRoundsPerGame
	}
	if buzzerEnabled != nil {
		m.tournament.BuzzerEnabled = *buzzerEnabled
	}
	return m.tournament, nil
}

func (m *Manager) RandomizeTeams(names []string) (*domain.Tournament, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	log.Println("MANAGER: RandomizeTeams called")

	if m.tournament == nil {
		return nil, errors.New("no tournament created")
	}

	// 1. Ensure we have teams created up to MaxTeams (or at least enough for reasonable distribution)
	// If current teams < MaxTeams, create them
	currentTeamCount := len(m.tournament.Teams)
	needed := m.tournament.MaxTeams - currentTeamCount
	log.Printf("MANAGER: Current teams: %d, Max: %d, Needed: %d", currentTeamCount, m.tournament.MaxTeams, needed)
	
	// Pre-defined colors/icons just for auto-creation
	// We might run out of unique colors if we just pick random, so let's try to be smart or just generic
	// For simplicity, we'll reuse logic or just generate basic ones.
	// Since we don't have the color list here easily without duplicating, 
	// let's just assume the frontend created teams OR we create simple placeholder ones.
	// Actually, the requirement implies we should auto-create.
	
	// Let's create missing teams
	for i := 0; i < needed; i++ {
		teamNum := currentTeamCount + i + 1
		teamName := fmt.Sprintf("Team %d", teamNum)
		// Simple color generation or fallback
		// Real app would have a color palette. Let's send a generic "gray" or rotate?
		// We'll leave color/image empty or default for now, forcing user to edit if they want, 
		// OR better: we don't create teams if they aren't there?
		// The plan said: "Check if teams need to be created (up to MaxTeams). Auto-create them if missing."
		
		team := domain.Team{
			ID:      uuid.NewString(),
			Name:    teamName,
			Score:   0,
			Members: []domain.TeamMember{},
			Color:   "#888888", // Default
			Image:   "🛡️",      // Default
		}
		m.tournament.Teams = append(m.tournament.Teams, team)
	}

	// 2. Clear all existing members
	for i := range m.tournament.Teams {
		m.tournament.Teams[i].Members = []domain.TeamMember{}
	}

	// 3. Shuffle names
	rand.Seed(time.Now().UnixNano())
	shuffled := make([]string, len(names))
	copy(shuffled, names)
	rand.Shuffle(len(shuffled), func(i, j int) {
		shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
	})

	// 4. Distribute
	if len(m.tournament.Teams) > 0 {
		for i, name := range shuffled {
			teamIdx := i % len(m.tournament.Teams)
			member := domain.TeamMember{
				ID:   uuid.NewString(),
				Name: name,
				Role: "Member",
			}
			m.tournament.Teams[teamIdx].Members = append(m.tournament.Teams[teamIdx].Members, member)
		}
	}
	
	log.Printf("MANAGER: RandomizeTeams finished. Total teams: %d", len(m.tournament.Teams))
	return m.tournament, nil
}

type ValidationResult struct {
	IsValid  bool     `json:"isValid"`
	Errors   []string `json:"errors"`
	Warnings []string `json:"warnings"`
}

func (m *Manager) ValidateTournamentStart() ValidationResult {
	m.mu.RLock()
	defer m.mu.RUnlock()

	if m.tournament == nil {
		return ValidationResult{IsValid: false, Errors: []string{"No tournament created"}, Warnings: []string{}}
	}

	errors := []string{}
	warnings := []string{}

	if len(m.tournament.Teams) < m.tournament.MinTeams {
		errors = append(errors, fmt.Sprintf("Need at least %d teams (currently %d)", m.tournament.MinTeams, len(m.tournament.Teams)))
	}

	for _, team := range m.tournament.Teams {
		if len(team.Members) < m.tournament.MinMembersPerTeam {
			errors = append(errors, fmt.Sprintf("Team \"%s\" needs at least %d members (currently %d)", team.Name, m.tournament.MinMembersPerTeam, len(team.Members)))
		}
	}

	// Check duplicate colors
	colors := make(map[string]bool)
	for _, team := range m.tournament.Teams {
		if colors[team.Color] {
			errors = append(errors, "Some teams have duplicate colors")
			break
		}
		colors[team.Color] = true
	}

	return ValidationResult{
		IsValid:  len(errors) == 0,
		Errors:   errors,
		Warnings: warnings,
	}
}

func (m *Manager) StartTournament() (*domain.Tournament, error) {
	// Note: ValidateTournamentStart calls RLock, so we shouldn't hold Lock here yet if we call it.
	// But to be safe and atomic, we should probably just duplicate validation logic or rely on caller?
	// Let's just call validate inside Lock to avoid race, but we need to be careful not to deadlock if validate calls RLock.
	// Actually, ValidateTournamentStart uses RLock. We can't upgrade RLock to Lock.
	// So we should just do the checks inside here manually or make a private validate method.
	
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.tournament == nil {
		return nil, errors.New("no tournament")
	}

	// Simple validation check inside lock
	if len(m.tournament.Teams) < m.tournament.MinTeams {
		return nil, errors.New("not enough teams")
	}

	m.tournament.Status = domain.StatusActive
	m.generateBracket()

	return m.tournament, nil
}

func (m *Manager) generateBracket() {
	// Simplified bracket generation
	teams := m.tournament.Teams
	var currentRoundMatches []*domain.Match
	var previousRoundMatches []*domain.Match

	// Create first round matches
	for i := 0; i < len(teams); i += 2 {
		if i+1 < len(teams) {
			match := m.createMatch(teams[i], teams[i+1])
			if match != nil {
				currentRoundMatches = append(currentRoundMatches, match)
			}
		}
	}

	previousRoundMatches = currentRoundMatches

	// Create subsequent rounds
	for len(previousRoundMatches) > 1 {
		currentRoundMatches = []*domain.Match{}
		for i := 0; i < len(previousRoundMatches); i += 2 {
			match := m.createPlaceholderMatch()
			if match != nil {
				previousRoundMatches[i].NextMatchID = match.ID
				if i+1 < len(previousRoundMatches) {
					previousRoundMatches[i+1].NextMatchID = match.ID
				}
				currentRoundMatches = append(currentRoundMatches, match)
			}
		}
		previousRoundMatches = currentRoundMatches
	}

	if len(m.tournament.Matches) > 0 {
		m.tournament.CurrentMatchID = m.tournament.Matches[0].ID
	}
}

func (m *Manager) createPlaceholderMatch() *domain.Match {
	match := &domain.Match{
		ID:                uuid.NewString(),
		GameCode:          m.generateGameCode(),
		TeamA:             domain.Team{ID: "TBD", Name: "TBD", Score: 0, Members: []domain.TeamMember{}, Color: "#333"},
		TeamB:             domain.Team{ID: "TBD", Name: "TBD", Score: 0, Members: []domain.TeamMember{}, Color: "#333"},
		Phase:             domain.PhaseIdle,
		CurrentTurnTeamID: "",
		AnsweringTeamID:   "",
		BuzzerLocked:      false,
		BuzzerWinnerID:    "",
		SelectedCategory:  "",
		SelectedStrategy:  "",
		SelectedOption:    nil,
		SelectedAnswer:    "",
		IsAnswerCorrect:   false,
		CurrentCard:       nil,
		CurrentQuestion:   nil,
		CurrentCardType:   "",
		AvailableOptions:  []domain.Option{},
		Timer:             0,
		TimerRunning:      false,
		WinnerID:          "",
		CurrentRound:      0,
		TotalRounds:       m.tournament.DefaultRoundsPerGame,
	}
	if match.TotalRounds == 0 {
		match.TotalRounds = 10
	}
	m.tournament.Matches = append(m.tournament.Matches, match)
	return match
}

func (m *Manager) createMatch(teamA domain.Team, teamB domain.Team) *domain.Match {
	teamA.Score = 0
	teamB.Score = 0
	match := &domain.Match{
		ID:                uuid.NewString(),
		GameCode:          m.generateGameCode(),
		TeamA:             teamA,
		TeamB:             teamB,
		Phase:             domain.PhaseIdle,
		CurrentTurnTeamID: "",
		AnsweringTeamID:   "",
		BuzzerLocked:      false,
		BuzzerWinnerID:    "",
		SelectedCategory:  "",
		SelectedStrategy:  "",
		SelectedOption:    nil,
		SelectedAnswer:    "",
		IsAnswerCorrect:   false,
		CurrentCard:       nil,
		CurrentQuestion:   nil,
		CurrentCardType:   "",
		AvailableOptions:  []domain.Option{},
		Timer:             0,
		TimerRunning:      false,
		WinnerID:          "",
		CurrentRound:      0,
		TotalRounds:       m.tournament.DefaultRoundsPerGame,
	}
	if match.TotalRounds == 0 {
		match.TotalRounds = 10
	}
	m.tournament.Matches = append(m.tournament.Matches, match)
	m.tournament.CurrentMatchID = match.ID
	return match
}

func (m *Manager) GetCurrentMatch() *domain.Match {
	m.mu.RLock()
	defer m.mu.RUnlock()
	if m.tournament == nil || m.tournament.CurrentMatchID == "" {
		return nil
	}
	for _, match := range m.tournament.Matches {
		if match.ID == m.tournament.CurrentMatchID {
			return match
		}
	}
	return nil
}

// --- Timer Logic ---

func (m *Manager) StartTimer(duration int) *domain.Match {
	m.mu.Lock()
	// We need to unlock before emitting events or we might deadlock if emit calls back into manager (unlikely but good practice)
	// However, we need to modify state.
	
	match := m.getCurrentMatchUnsafe()
	if match == nil {
		m.mu.Unlock()
		return nil
	}

	if m.timerTicker != nil {
		m.timerTicker.Stop()
		if m.timerStopChan != nil {
			close(m.timerStopChan)
		}
	}

	match.Timer = duration
	match.TimerRunning = true
	
	m.timerTicker = time.NewTicker(1 * time.Second)
	m.timerStopChan = make(chan bool)

	// We need to release lock before starting goroutine loop that acquires lock
	m.mu.Unlock()

	go func() {
		for {
			select {
			case <-m.timerStopChan:
				return
			case <-m.timerTicker.C:
				m.mu.Lock()
				match := m.getCurrentMatchUnsafe()
				if match == nil || match.Timer <= 0 {
					m.stopTimerUnsafe()
					m.mu.Unlock()
					if m.io != nil {
						m.io.Emit("timer:end", nil)
					}
					return
				}
				match.Timer--
				timerValue := match.Timer
				m.mu.Unlock()
				
				if m.io != nil {
					m.io.Emit("timer:update", timerValue)
				}
			}
		}
	}()

	return match
}

func (m *Manager) StopTimer() *domain.Match {
	m.mu.Lock()
	defer m.mu.Unlock()
	return m.stopTimerUnsafe()
}

func (m *Manager) stopTimerUnsafe() *domain.Match {
	match := m.getCurrentMatchUnsafe()
	if match == nil {
		return nil
	}

	if m.timerTicker != nil {
		m.timerTicker.Stop()
		m.timerTicker = nil
	}
	if m.timerStopChan != nil {
		// Non-blocking close check
		select {
		case <-m.timerStopChan:
		default:
			close(m.timerStopChan)
		}
		m.timerStopChan = nil
	}
	match.TimerRunning = false
	return match
}

func (m *Manager) AddTime(seconds int) *domain.Match {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	match := m.getCurrentMatchUnsafe()
	if match == nil {
		return nil
	}
	match.Timer += seconds
	// Emit update immediately
	if m.io != nil {
		go m.io.Emit("timer:update", match.Timer)
	}
	return match
}

// --- Match Logic ---

func (m *Manager) StartMatch() *domain.Match {
	m.mu.Lock()
	defer m.mu.Unlock()

	match := m.getCurrentMatchUnsafe()
	if match == nil {
		return nil
	}

	match.Phase = domain.PhaseBuzzer
	match.CurrentQuestion = nil
	return match
}

func (m *Manager) HandleBuzzer(teamID string) *domain.Match {
	m.mu.Lock()
	defer m.mu.Unlock()

	match := m.getCurrentMatchUnsafe()
	if match == nil || match.Phase != domain.PhaseBuzzer || match.BuzzerLocked {
		return nil
	}

	match.BuzzerLocked = true
	match.BuzzerWinnerID = teamID
	if match.TimerRunning {
		m.stopTimerUnsafe()
	}
	return match
}

func (m *Manager) JudgeBuzzer(winnerTeamID string) *domain.Match {
	m.mu.Lock()
	defer m.mu.Unlock()

	match := m.getCurrentMatchUnsafe()
	if match == nil || match.Phase != domain.PhaseBuzzer {
		return nil
	}

	if winnerTeamID != "" {
		match.CurrentTurnTeamID = winnerTeamID
		match.AnsweringTeamID = ""
		match.AvailableOptions = m.getRandomOptions(3)
		match.Phase = domain.PhaseCategorySelect
		match.CurrentRound = 1
	} else {
		match.BuzzerLocked = false
		match.BuzzerWinnerID = ""
	}
	return match
}

func (m *Manager) SelectAnswer(answer string) *domain.Match {
	m.mu.Lock()
	defer m.mu.Unlock()

	match := m.getCurrentMatchUnsafe()
	if match == nil || match.Phase != domain.PhaseAnswerSelect {
		return nil
	}

	match.SelectedAnswer = answer
	
	// Auto-check
	// Need to cast CurrentQuestion to map or struct to access Answer
	// Since we used interface{}, we need type assertion or reflection.
	// For simplicity, let's assume we can cast to GameCard or similar map
	
	// In Go, since we store as interface{}, we might need a helper or just check if it's a map
	// The CardService returns GameCard struct.
	if card, ok := match.CurrentQuestion.(cards.GameCard); ok {
		match.IsAnswerCorrect = strings.TrimSpace(strings.ToLower(answer)) == strings.TrimSpace(strings.ToLower(card.CorrectAnswer))
	} else if cardPtr, ok := match.CurrentQuestion.(*cards.GameCard); ok {
		match.IsAnswerCorrect = strings.TrimSpace(strings.ToLower(answer)) == strings.TrimSpace(strings.ToLower(cardPtr.CorrectAnswer))
	}

	match.Phase = domain.PhaseAnswerApproval
	return match
}

func (m *Manager) ApproveAnswer(approved bool) *domain.Match {
	m.mu.Lock()
	defer m.mu.Unlock()

	match := m.getCurrentMatchUnsafe()
	if match == nil || match.Phase != domain.PhaseAnswerApproval {
		return nil
	}

	isCorrect := approved && match.IsAnswerCorrect
	questionPoints := 100
	
	// Try to get points from card
	if card, ok := match.CurrentQuestion.(cards.GameCard); ok {
		questionPoints = card.Points
	} else if card, ok := match.CurrentCard.(cards.GameCard); ok {
		questionPoints = card.Points
	} else if cardPtr, ok := match.CurrentQuestion.(*cards.GameCard); ok {
		questionPoints = cardPtr.Points
	} else if cardPtr, ok := match.CurrentCard.(*cards.GameCard); ok {
		questionPoints = cardPtr.Points
	}

	if match.CurrentCardType == domain.CardTypeQuestion {
		if isCorrect && match.CurrentTurnTeamID != "" {
			if match.CurrentTurnTeamID == match.TeamA.ID {
				match.TeamA.Score += questionPoints
			} else {
				match.TeamB.Score += questionPoints
			}
		}
	} else if match.CurrentCardType == domain.CardTypeDare {
		halfPoints := int(math.Floor(float64(questionPoints) / 2))
		if isCorrect && match.AnsweringTeamID != "" {
			if match.AnsweringTeamID == match.TeamA.ID {
				match.TeamA.Score += halfPoints
			} else {
				match.TeamB.Score += halfPoints
			}
		} else if !isCorrect && match.CurrentTurnTeamID != "" {
			if match.CurrentTurnTeamID == match.TeamA.ID {
				match.TeamA.Score += halfPoints
			} else {
				match.TeamB.Score += halfPoints
			}
		}
	}

	match.Phase = domain.PhaseScoring
	return match
}

func (m *Manager) NextRound() *domain.Match {
	m.mu.Lock()
	defer m.mu.Unlock()

	match := m.getCurrentMatchUnsafe()
	if match == nil || match.Phase != domain.PhaseScoring {
		return nil
	}

	match.CurrentRound++
	if match.CurrentRound > match.TotalRounds {
		// End Match logic
		// For now just set phase to finished
		match.Phase = domain.PhaseFinished
		return match
	}

	nextTurnTeamID := match.TeamA.ID
	if match.CurrentTurnTeamID == match.TeamA.ID {
		nextTurnTeamID = match.TeamB.ID
	}

	match.CurrentTurnTeamID = nextTurnTeamID
	match.AnsweringTeamID = ""
	match.SelectedOption = nil
	match.SelectedAnswer = ""
	match.IsAnswerCorrect = false
	match.CurrentCard = nil
	match.CurrentQuestion = nil
	match.AvailableOptions = m.getRandomOptions(3)
	m.stopTimerUnsafe()
	match.Timer = 0
	
	match.Phase = domain.PhaseCategorySelect
	return match
}

func (m *Manager) SelectOption(option domain.Option) *domain.Match {
	m.mu.Lock()
	defer m.mu.Unlock()

	match := m.getCurrentMatchUnsafe()
	if match == nil || match.Phase != domain.PhaseCategorySelect {
		return nil
	}

	match.SelectedOption = &option
	
	// Get card, excluding already used cards in this tournament
	usedIDs := m.tournament.UsedCardIDs
	gameCard := m.cardService.GetByCategoryAndDifficultyExclude(option.Category, option.Difficulty, usedIDs)
	
	// Fallback to category only (still excluding used)
	if gameCard == nil {
		gameCard = m.cardService.GetByCategoryExclude(option.Category, usedIDs)
	}

	if gameCard != nil {
		// Track this card as used
		m.tournament.UsedCardIDs = append(m.tournament.UsedCardIDs, gameCard.ID)

		if gameCard.Type == cards.TypeTruth {
			match.CurrentQuestion = gameCard
			match.CurrentCard = nil
			match.CurrentCardType = domain.CardTypeQuestion
			match.AnsweringTeamID = match.CurrentTurnTeamID
			
			// We need to unlock to call StartTimer because it locks
			// But we are in a lock. So we should probably refactor StartTimer to have an unsafe version
			// Or just set timer manually here since we are in lock
			if m.tournament.DefaultQuestionTime > 0 {
				// We can't call m.StartTimer(duration) here because it locks.
				// We need to implement startTimerUnsafe or handle it.
				// For now, let's just set the timer state and launch the goroutine
				// BUT launching goroutine needs to be careful about race conditions if it accesses map immediately.
				// The safe way is to call StartTimer AFTER unlocking.
				// So we will return match, and maybe have a flag or just let the caller handle it?
				// Better: Implement startTimerUnsafe logic here.
				
				// Stop existing
				if m.timerTicker != nil {
					m.timerTicker.Stop()
					if m.timerStopChan != nil {
						close(m.timerStopChan)
					}
				}
				match.Timer = m.tournament.DefaultQuestionTime
				match.TimerRunning = true
				m.timerTicker = time.NewTicker(1 * time.Second)
				m.timerStopChan = make(chan bool)
				
				// Launch goroutine
				go func(ticker *time.Ticker, stopChan chan bool) {
					for {
						select {
						case <-stopChan:
							return
						case <-ticker.C:
							m.mu.Lock()
							// Re-fetch match to be safe
							currentMatch := m.getCurrentMatchUnsafe()
							if currentMatch == nil || currentMatch.Timer <= 0 {
								m.stopTimerUnsafe()
								m.mu.Unlock()
								if m.io != nil {
									m.io.Emit("timer:end", nil)
								}
								return
							}
							currentMatch.Timer--
							val := currentMatch.Timer
							m.mu.Unlock()
							if m.io != nil {
								m.io.Emit("timer:update", val)
							}
						}
					}
				}(m.timerTicker, m.timerStopChan)
			}
			
			match.Phase = domain.PhaseAnswerSelect

		} else {
			match.CurrentCard = gameCard
			match.CurrentQuestion = nil
			match.CurrentCardType = domain.CardTypeDare
			match.Phase = domain.PhaseStrategySelect
		}
	}

	return match
}

func (m *Manager) SelectStrategy(strategy string) *domain.Match {
	m.mu.Lock()
	defer m.mu.Unlock()

	match := m.getCurrentMatchUnsafe()
	if match == nil || match.Phase != domain.PhaseStrategySelect {
		return nil
	}

	if strategy == "TRUTH" {
		match.AnsweringTeamID = match.CurrentTurnTeamID
	} else {
		if match.CurrentTurnTeamID == match.TeamA.ID {
			match.AnsweringTeamID = match.TeamB.ID
		} else {
			match.AnsweringTeamID = match.TeamA.ID
		}
	}
	
	match.Phase = domain.PhaseReveal
	return match
}

func (m *Manager) ConfirmReveal() *domain.Match {
	m.mu.Lock()
	defer m.mu.Unlock()

	match := m.getCurrentMatchUnsafe()
	if match == nil || match.Phase != domain.PhaseReveal {
		return nil
	}

	if match.CurrentCardType == domain.CardTypeDare && m.tournament.DefaultDareTime > 0 {
		// Start timer unsafe logic again
		if m.timerTicker != nil {
			m.timerTicker.Stop()
			if m.timerStopChan != nil {
				close(m.timerStopChan)
			}
		}
		match.Timer = m.tournament.DefaultDareTime
		match.TimerRunning = true
		m.timerTicker = time.NewTicker(1 * time.Second)
		m.timerStopChan = make(chan bool)
		
		go func(ticker *time.Ticker, stopChan chan bool) {
			for {
				select {
				case <-stopChan:
					return
				case <-ticker.C:
					m.mu.Lock()
					currentMatch := m.getCurrentMatchUnsafe()
					if currentMatch == nil || currentMatch.Timer <= 0 {
						m.stopTimerUnsafe()
						m.mu.Unlock()
						if m.io != nil {
							m.io.Emit("timer:end", nil)
						}
						return
					}
					currentMatch.Timer--
					val := currentMatch.Timer
					m.mu.Unlock()
					if m.io != nil {
						m.io.Emit("timer:update", val)
					}
				}
			}
		}(m.timerTicker, m.timerStopChan)
	}

	match.Phase = domain.PhaseAction
	return match
}

func (m *Manager) ScoreAction(success bool) *domain.Match {
	m.mu.Lock()
	defer m.mu.Unlock()

	match := m.getCurrentMatchUnsafe()
	if match == nil || match.Phase != domain.PhaseAction {
		return nil
	}

	if match.CurrentCard != nil && match.CurrentCardType == domain.CardTypeDare {
		var fullPoints int
		if card, ok := match.CurrentCard.(cards.GameCard); ok {
			fullPoints = card.Points
		} else if cardPtr, ok := match.CurrentCard.(*cards.GameCard); ok {
			fullPoints = cardPtr.Points
		}
		
		halfPoints := int(math.Floor(float64(fullPoints) / 2))
		isSelfPlay := match.AnsweringTeamID == match.CurrentTurnTeamID

		if isSelfPlay {
			if success {
				if match.AnsweringTeamID == match.TeamA.ID {
					match.TeamA.Score += fullPoints
				} else {
					match.TeamB.Score += fullPoints
				}
			}
		} else {
			if success {
				if match.AnsweringTeamID == match.TeamA.ID {
					match.TeamA.Score += halfPoints
				} else {
					match.TeamB.Score += halfPoints
				}
			} else {
				// Fail - Challenger gets points
				if match.CurrentTurnTeamID == match.TeamA.ID {
					match.TeamA.Score += halfPoints
				} else {
					match.TeamB.Score += halfPoints
				}
			}
		}
	}
	
	match.Phase = domain.PhaseScoring
	return match
}

func (m *Manager) EndMatch(matchID string) *domain.Match {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	match := m.getCurrentMatchUnsafe()
	if match == nil {
		return nil
	}
	
	match.Phase = domain.PhaseEnd
	return match
}

func (m *Manager) UpdateMatchRounds(rounds int) *domain.Match {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	match := m.getCurrentMatchUnsafe()
	if match == nil {
		return nil
	}
	
	match.TotalRounds = rounds
	return match
}

// Helper to get match without locking (must be called within a lock)
func (m *Manager) getCurrentMatchUnsafe() *domain.Match {
	if m.tournament == nil || m.tournament.CurrentMatchID == "" {
		return nil
	}
	for _, match := range m.tournament.Matches {
		if match.ID == m.tournament.CurrentMatchID {
			return match
		}
	}
	return nil
}
