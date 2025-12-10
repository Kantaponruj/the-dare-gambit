// Types shared across the game application
// These match the backend domain types

export interface TeamMember {
  id: string;
  name: string;
  role?: string;
}

export interface Team {
  id: string;
  name: string;
  score: number;
  members: TeamMember[];
  color: string;
  image?: string;
}

export interface Option {
  category: string;
  difficulty: string;
}

export interface GameCard {
  id: string;
  category: string;
  categoryId?: string;
  text: string;
  difficulty: string;
  points: number;
  type: "TRUTH" | "DARE";
  answers?: string[];
  correctAnswer?: string;
  choices?: string[]; // Alternative name for answers
  answer?: string; // Alternative name for correctAnswer
}

export interface Match {
  id: string;
  gameCode: string;
  teamA: Team;
  teamB: Team;
  phase: string;
  currentTurnTeamId: string;
  answeringTeamId: string;
  buzzerLocked: boolean;
  buzzerWinnerId: string;
  selectedCategory: string;
  selectedStrategy: string;
  selectedAnswer: string;
  isAnswerCorrect: boolean;
  currentCard: GameCard | null;
  currentQuestion: GameCard | null;
  currentCardType: "question" | "dare" | "";
  availableOptions: Option[];
  selectedOption: Option | null;
  timer: number;
  timerRunning: boolean;
  winnerId: string;
  currentRound: number;
  totalRounds: number;
  nextMatchId?: string;
}

export interface Tournament {
  id: string;
  name: string;
  teams: Team[];
  matches: Match[];
  currentMatchId: string;
  status: "REGISTRATION" | "ACTIVE" | "FINISHED";
  maxTeams: number;
  minTeams: number;
  minMembersPerTeam: number;
  defaultQuestionTime: number;
  defaultDareTime: number;
  defaultRoundsPerGame: number;
  buzzerEnabled: boolean;
  usedCardIds?: string[];
}
