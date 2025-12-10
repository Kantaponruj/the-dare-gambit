package domain

// TeamMember represents a member of a team
type TeamMember struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Role string `json:"role,omitempty"`
}

// Team represents a team in the tournament
type Team struct {
	ID      string       `json:"id"`
	Name    string       `json:"name"`
	Score   int          `json:"score"`
	Members []TeamMember `json:"members"`
	Color   string       `json:"color"`
	Image   string       `json:"image,omitempty"`
}

// MatchPhase represents the current state of a match
type MatchPhase string

const (
	PhaseIdle           MatchPhase = "IDLE"
	PhaseBuzzer         MatchPhase = "BUZZER"
	PhaseAnswerSelect   MatchPhase = "ANSWER_SELECT"
	PhaseAnswerApproval MatchPhase = "ANSWER_APPROVAL"
	PhaseCategorySelect MatchPhase = "CATEGORY_SELECT"
	PhaseStrategySelect MatchPhase = "STRATEGY_SELECT"
	PhaseReveal         MatchPhase = "REVEAL"
	PhaseAction         MatchPhase = "ACTION"
	PhaseScoring        MatchPhase = "SCORING"
	PhaseFinished       MatchPhase = "FINISHED"
	PhaseEnd            MatchPhase = "END"
)

// CardType represents the type of the current card
type CardType string

const (
	CardTypeQuestion CardType = "question"
	CardTypeDare     CardType = "dare"
)

// Option represents a category and difficulty selection
type Option struct {
	Category   string `json:"category"`
	Difficulty string `json:"difficulty"`
}

// Match represents a single game match
type Match struct {
	ID                string      `json:"id"`
	GameCode          string      `json:"gameCode"`
	TeamA             Team        `json:"teamA"`
	TeamB             Team        `json:"teamB"`
	Phase             MatchPhase  `json:"phase"`
	CurrentTurnTeamID string      `json:"currentTurnTeamId"` // Nullable in TS, empty string if null
	AnsweringTeamID   string      `json:"answeringTeamId"`
	BuzzerLocked      bool        `json:"buzzerLocked"`
	BuzzerWinnerID    string      `json:"buzzerWinnerId"`
	SelectedCategory  string      `json:"selectedCategory"`
	SelectedStrategy  string      `json:"selectedStrategy"` // "TRUTH" | "DARE"
	SelectedAnswer    string      `json:"selectedAnswer"`
	IsAnswerCorrect   bool        `json:"isAnswerCorrect"` // Nullable in TS, false if null/false
	CurrentCard       interface{} `json:"currentCard"`     // Can be Question or Dare card
	CurrentQuestion   interface{} `json:"currentQuestion"`
	CurrentCardType   CardType    `json:"currentCardType"`
	AvailableOptions  []Option    `json:"availableOptions"`
	SelectedOption    *Option     `json:"selectedOption"`
	Timer             int         `json:"timer"` // Nullable in TS, -1 or 0 if null
	TimerRunning      bool        `json:"timerRunning"`
	WinnerID          string      `json:"winnerId"`
	CurrentRound      int         `json:"currentRound"`
	TotalRounds       int         `json:"totalRounds"`
	NextMatchID       string      `json:"nextMatchId,omitempty"`
}

// TournamentStatus represents the status of the tournament
type TournamentStatus string

const (
	StatusRegistration TournamentStatus = "REGISTRATION"
	StatusActive       TournamentStatus = "ACTIVE"
	StatusFinished     TournamentStatus = "FINISHED"
)

// Tournament represents the overall tournament structure
type Tournament struct {
	ID                   string           `json:"id"`
	Name                 string           `json:"name"`
	Teams                []Team           `json:"teams"`
	Matches              []*Match         `json:"matches"`
	CurrentMatchID       string           `json:"currentMatchId"`
	Status               TournamentStatus `json:"status"`
	MaxTeams             int              `json:"maxTeams"`
	MinTeams             int              `json:"minTeams"`
	MinMembersPerTeam    int              `json:"minMembersPerTeam"`
	DefaultQuestionTime  int              `json:"defaultQuestionTime"`
	DefaultDareTime      int              `json:"defaultDareTime"`
	DefaultRoundsPerGame int              `json:"defaultRoundsPerGame"`
	BuzzerEnabled        bool             `json:"buzzerEnabled"`
	UsedCardIDs          []string         `json:"usedCardIds,omitempty"` // Track used cards to prevent duplicates
}
