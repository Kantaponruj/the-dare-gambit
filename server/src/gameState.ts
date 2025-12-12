import { v4 as uuidv4 } from "uuid";
import { cardService } from "./services/cardService.js";

export type TeamMember = {
  id: string;
  name: string;
  role?: string;
};

export type Team = {
  id: string;
  name: string;
  score: number;
  members: TeamMember[];
  color: string;
  image?: string;
};

export type MatchPhase =
  | "IDLE"
  | "BUZZER"
  | "ANSWER_SELECT" // Player selects from multiple choice
  | "ANSWER_APPROVAL" // GM approves the answer
  | "CATEGORY_SELECT"
  | "STRATEGY_SELECT"
  | "REVEAL"
  | "ACTION" // For DARE cards - GM judges performance
  | "SCORING"
  | "FINISHED"
  | "END";

export type Match = {
  id: string;
  gameCode: string; // 6-digit code for players to join
  teamA: Team;
  teamB: Team;
  phase: MatchPhase;
  currentTurnTeamId: string | null; // Who has control
  answeringTeamId: string | null; // Who is answering (for DARE scenarios)
  buzzerLocked: boolean;
  buzzerWinnerId: string | null;
  selectedCategory: string | null;
  selectedStrategy: "TRUTH" | "DARE" | null;
  selectedAnswer: string | null; // Selected answer from choices
  isAnswerCorrect: boolean | null; // Auto-checked answer
  currentCard: any | null; // Placeholder for card data
  currentQuestion: any | null; // Question for the host to read
  currentCardType: "question" | "dare" | null; // Type of current card
  availableOptions: { category: string; difficulty: string }[]; // Categories + Difficulty available for selection
  selectedOption: { category: string; difficulty: string } | null;
  timer: number | null;
  timerRunning: boolean;
  winnerId: string | null;
  currentRound: number;
  totalRounds: number;
  nextMatchId?: string; // ID of the match the winner advances to
};

export type Tournament = {
  id: string;
  name: string;
  teams: Team[];
  matches: Match[]; // Simplified bracket for now
  currentMatchId: string | null;
  status: "REGISTRATION" | "ACTIVE" | "FINISHED";
  maxTeams: number;
  minTeams: number;
  minMembersPerTeam: number;
  defaultQuestionTime: number; // Timer duration for question cards (seconds)
  defaultDareTime: number; // Timer duration for dare cards (seconds)
  defaultRoundsPerGame: number; // Number of rounds per game (default: 10)
  buzzerEnabled: boolean; // Whether buzzer phase is enabled (default: true)
};

export class GameManager {
  private tournament: Tournament | null = null;
  // private allCategories: string[] = []; // Removed: Use dynamic categories
  private difficulties: string[] = ["EASY", "MEDIUM", "HARD"];

  private getRandomOptions(
    count: number = 3
  ): { category: string; difficulty: string }[] {
    const options: { category: string; difficulty: string }[] = [];
    // Get dynamic categories from service
    const allCategories = cardService.getCategories().map((c) => c.name);

    // Fallback if no categories exist yet
    if (allCategories.length === 0) {
      return [];
    }

    const shuffledCats = [...allCategories].sort(() => 0.5 - Math.random());

    for (let i = 0; i < count; i++) {
      const category = shuffledCats[i % shuffledCats.length];
      const difficulty =
        this.difficulties[Math.floor(Math.random() * this.difficulties.length)];
      options.push({ category, difficulty });
    }
    return options;
  }

  private generateGameCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  createTournament(
    name: string,
    maxTeams: number,
    defaultRoundsPerGame: number = 10,
    buzzerEnabled: boolean = true
  ) {
    this.tournament = {
      id: uuidv4(),
      name,
      teams: [],
      matches: [],
      currentMatchId: null,
      status: "REGISTRATION",
      maxTeams,
      minTeams: 2,
      minMembersPerTeam: 1,
      defaultQuestionTime: 30, // 30 seconds for questions
      defaultDareTime: 60, // 60 seconds for dares
      defaultRoundsPerGame, // Use the provided value
      buzzerEnabled, // Enable/disable buzzer phase
    };
    return this.tournament;
  }

  getTournament() {
    return this.tournament;
  }

  registerTeam(name: string, color: string = "#3b82f6", image?: string) {
    if (!this.tournament) throw new Error("No tournament created");
    if (this.tournament.teams.length >= this.tournament.maxTeams)
      throw new Error("Tournament full");

    // Check if color is already used
    const colorExists = this.tournament.teams.some((t) => t.color === color);
    if (colorExists) throw new Error("Color already in use");

    const team: Team = {
      id: uuidv4(),
      name,
      score: 0,
      members: [],
      color,
      image,
    };
    this.tournament.teams.push(team);
    return team;
  }

  updateTournament(name: string, maxTeams: number) {
    if (!this.tournament) throw new Error("No tournament created");

    // Validate maxTeams
    if (maxTeams < this.tournament.teams.length) {
      throw new Error(
        `Cannot reduce max teams below current team count (${this.tournament.teams.length})`
      );
    }

    this.tournament.name = name;
    this.tournament.maxTeams = maxTeams;
    return this.tournament;
  }

  updateTeam(teamId: string, name: string) {
    if (!this.tournament) throw new Error("No tournament created");

    const team = this.tournament.teams.find((t) => t.id === teamId);
    if (!team) throw new Error("Team not found");

    team.name = name;
    return team;
  }

  deleteTeam(teamId: string) {
    if (!this.tournament) throw new Error("No tournament created");

    const index = this.tournament.teams.findIndex((t) => t.id === teamId);
    if (index === -1) throw new Error("Team not found");

    this.tournament.teams.splice(index, 1);
    return this.tournament;
  }

  // Team Member Management
  addTeamMember(teamId: string, memberName: string, role?: string) {
    if (!this.tournament) throw new Error("No tournament created");

    const team = this.tournament.teams.find((t) => t.id === teamId);
    if (!team) throw new Error("Team not found");

    const member: TeamMember = {
      id: uuidv4(),
      name: memberName,
      role,
    };

    team.members.push(member);
    return member;
  }

  updateTeamMember(
    teamId: string,
    memberId: string,
    name: string,
    role?: string
  ) {
    if (!this.tournament) throw new Error("No tournament created");

    const team = this.tournament.teams.find((t) => t.id === teamId);
    if (!team) throw new Error("Team not found");

    const member = team.members.find((m) => m.id === memberId);
    if (!member) throw new Error("Member not found");

    member.name = name;
    if (role !== undefined) member.role = role;
    return member;
  }

  removeTeamMember(teamId: string, memberId: string) {
    if (!this.tournament) throw new Error("No tournament created");

    const team = this.tournament.teams.find((t) => t.id === teamId);
    if (!team) throw new Error("Team not found");

    const index = team.members.findIndex((m) => m.id === memberId);
    if (index === -1) throw new Error("Member not found");

    team.members.splice(index, 1);
    return team;
  }

  // Team Color and Image
  updateTeamColor(teamId: string, color: string) {
    if (!this.tournament) throw new Error("No tournament created");

    // Check if color is already used by another team
    const colorExists = this.tournament.teams.some(
      (t) => t.id !== teamId && t.color === color
    );
    if (colorExists) throw new Error("Color already in use");

    const team = this.tournament.teams.find((t) => t.id === teamId);
    if (!team) throw new Error("Team not found");

    team.color = color;
    return team;
  }

  updateTeamImage(teamId: string, image: string) {
    if (!this.tournament) throw new Error("No tournament created");

    const team = this.tournament.teams.find((t) => t.id === teamId);
    if (!team) throw new Error("Team not found");

    team.image = image;
    return team;
  }

  // Tournament Settings
  updateTournamentSettings(
    minTeams: number,
    minMembersPerTeam: number,
    defaultRoundsPerGame?: number,
    buzzerEnabled?: boolean
  ) {
    if (!this.tournament) throw new Error("No tournament created");

    this.tournament.minTeams = minTeams;
    this.tournament.minMembersPerTeam = minMembersPerTeam;
    if (defaultRoundsPerGame !== undefined) {
      this.tournament.defaultRoundsPerGame = defaultRoundsPerGame;
    }
    if (buzzerEnabled !== undefined) {
      this.tournament.buzzerEnabled = buzzerEnabled;
    }
    return this.tournament;
  }

  // --- New Logic ---

  randomizeTeams(names: string[]) {
    if (!this.tournament) throw new Error("No tournament created");

    if (this.tournament.maxTeams < 2) this.tournament.maxTeams = 4;
    const neededTeams = this.tournament.maxTeams;

    const colors = [
      "#FF5733",
      "#33FF57",
      "#3357FF",
      "#F033FF",
      "#FF33A8",
      "#33FFF5",
      "#F5FF33",
      "#FF8C33",
      "#8C33FF",
      "#33FF8C",
      "#FF3333",
      "#3333FF",
      "#33FF33",
      "#FFFF33",
      "#00FFFF",
      "#FF00FF",
    ];
    const icons = [
      "🦁",
      "🐯",
      "🐻",
      "🦅",
      "🐺",
      "🦊",
      "🐉",
      "🦈",
      "🦄",
      "🐲",
      "🦖",
      "🦕",
      "🐙",
      "🦑",
      "🦇",
      "🦉",
    ];

    // Create Teams
    const newTeams: Team[] = [];
    for (let i = 0; i < neededTeams; i++) {
      newTeams.push({
        id: uuidv4(),
        name: `Team ${i + 1}`,
        score: 0,
        members: [],
        color: colors[i % colors.length],
        image: icons[i % icons.length],
      });
    }

    // Shuffle Names
    const shuffled = [...names].sort(() => 0.5 - Math.random());

    // Distribute
    shuffled.forEach((name, i) => {
      const teamIdx = i % newTeams.length;
      newTeams[teamIdx].members.push({
        id: uuidv4(),
        name: name,
        role: "Member",
      });
    });

    this.tournament.teams = newTeams;
    return this.tournament;
  }

  setTeams(teams: Team[]) {
    if (!this.tournament) throw new Error("No tournament created");
    // Basic validation if needed
    this.tournament.teams = teams;
    return this.tournament;
  }

  // Validation
  validateTournamentStart() {
    if (!this.tournament) {
      return {
        isValid: false,
        errors: ["No tournament created"],
        warnings: [],
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check minimum teams
    if (this.tournament.teams.length < this.tournament.minTeams) {
      errors.push(
        `Need at least ${this.tournament.minTeams} teams (currently ${this.tournament.teams.length})`
      );
    }

    // Check each team has minimum members
    this.tournament.teams.forEach((team) => {
      if (team.members.length < this.tournament!.minMembersPerTeam) {
        errors.push(
          `Team "${team.name}" needs at least ${
            this.tournament!.minMembersPerTeam
          } members (currently ${team.members.length})`
        );
      }
    });

    // Check for duplicate colors
    const colors = this.tournament.teams.map((t) => t.color);
    const duplicateColors = colors.filter(
      (color, index) => colors.indexOf(color) !== index
    );
    if (duplicateColors.length > 0) {
      errors.push("Some teams have duplicate colors");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  startTournament() {
    if (!this.tournament) throw new Error("No tournament");

    // Validate before starting
    const validation = this.validateTournamentStart();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "));
    }

    this.tournament.status = "ACTIVE";

    // Generate full bracket
    this.generateBracket();

    return this.tournament;
  }

  generateBracket() {
    if (!this.tournament) return;

    const teams = [...this.tournament.teams];
    // Ensure power of 2 teams? For now, assume even number or handle byes later.
    // If odd, one team gets a bye. For MVP, let's assume even or just pair up.

    // const rounds = Math.ceil(Math.log2(teams.length));
    let currentRoundMatches: Match[] = [];
    let previousRoundMatches: Match[] = [];

    // Create first round matches
    for (let i = 0; i < teams.length; i += 2) {
      if (i + 1 < teams.length) {
        const match = this.createMatch(teams[i], teams[i + 1]);
        if (match) currentRoundMatches.push(match);
      } else {
        // Bye?
      }
    }

    previousRoundMatches = currentRoundMatches;

    // Create subsequent rounds
    while (previousRoundMatches.length > 1) {
      currentRoundMatches = [];
      for (let i = 0; i < previousRoundMatches.length; i += 2) {
        const match = this.createPlaceholderMatch();
        if (match) {
          // Link previous matches to this one
          previousRoundMatches[i].nextMatchId = match.id;
          if (i + 1 < previousRoundMatches.length) {
            previousRoundMatches[i + 1].nextMatchId = match.id;
          }
          currentRoundMatches.push(match);
        }
      }
      previousRoundMatches = currentRoundMatches;
    }

    // Set current match to the first one
    if (this.tournament.matches.length > 0) {
      this.tournament.currentMatchId = this.tournament.matches[0].id;
    }
  }

  createPlaceholderMatch() {
    if (!this.tournament) return;
    const match: Match = {
      id: uuidv4(),
      gameCode: this.generateGameCode(),
      teamA: { id: "TBD", name: "TBD", score: 0, members: [], color: "#333" },
      teamB: { id: "TBD", name: "TBD", score: 0, members: [], color: "#333" },
      phase: "IDLE",
      currentTurnTeamId: null,
      answeringTeamId: null,
      buzzerLocked: false,
      buzzerWinnerId: null,
      selectedCategory: null,
      selectedStrategy: null,
      selectedOption: null,
      selectedAnswer: null,
      isAnswerCorrect: null,
      currentCard: null,
      currentQuestion: null,
      currentCardType: null,
      availableOptions: [],
      timer: null,
      timerRunning: false,
      winnerId: null,
      currentRound: 0,
      totalRounds: this.tournament.defaultRoundsPerGame || 10,
    };
    this.tournament.matches.push(match);
    return match;
  }

  createMatch(teamA: Team, teamB: Team) {
    if (!this.tournament) return;
    const match: Match = {
      id: uuidv4(),
      gameCode: this.generateGameCode(),
      teamA: { ...teamA, score: 0 }, // Reset score for match? Or keep tournament score? Let's reset for match.
      teamB: { ...teamB, score: 0 },
      phase: "IDLE",
      currentTurnTeamId: null,
      answeringTeamId: null,
      buzzerLocked: false,
      buzzerWinnerId: null,
      selectedCategory: null,
      selectedStrategy: null,
      selectedOption: null,
      selectedAnswer: null,
      isAnswerCorrect: null,
      currentCard: null,
      currentQuestion: null,
      currentCardType: null,
      availableOptions: [],
      timer: null,
      timerRunning: false,
      winnerId: null,
      currentRound: 0,
      totalRounds: this.tournament.defaultRoundsPerGame || 10,
    };
    this.tournament.matches.push(match);
    this.tournament.currentMatchId = match.id;
    return match;
  }

  getCurrentMatch() {
    if (!this.tournament || !this.tournament.currentMatchId) return null;
    return (
      this.tournament.matches.find(
        (m) => m.id === this.tournament?.currentMatchId
      ) || null
    );
  }

  startNextMatch() {
    if (!this.tournament) return null;
    const tournament = this.tournament;
    const nextMatch = this.tournament.matches.find(
      (m) =>
        m.phase === "IDLE" &&
        m.teamA.id !== "TBD" &&
        m.teamB.id !== "TBD" &&
        m.id !== tournament.currentMatchId
    );

    if (nextMatch) {
      this.tournament.currentMatchId = nextMatch.id;
      return nextMatch;
    }
    return null;
  }

  endMatch(matchId: string) {
    if (!this.tournament) throw new Error("No tournament");

    const match = this.tournament.matches.find((m) => m.id === matchId);
    if (!match) throw new Error("Match not found");

    // Determine winner by score (simple rule). On tie, prefer teamA.
    let winner = null as Team | null;
    if (match.teamA.score > match.teamB.score) winner = match.teamA;
    else if (match.teamB.score > match.teamA.score) winner = match.teamB;
    else winner = match.teamA;

    match.winnerId = winner.id;
    match.phase = "FINISHED";

    // Cleanup transient state
    match.buzzerLocked = false;
    match.buzzerWinnerId = null;
    match.timerRunning = false;

    // Advance winner into next match placeholder if present
    if (match.nextMatchId) {
      const nextMatch = this.tournament.matches.find(
        (m) => m.id === match.nextMatchId
      );
      if (nextMatch) {
        const advancingTeam: Team = { ...winner, score: 0 };
        if (nextMatch.teamA.id === "TBD") {
          nextMatch.teamA = advancingTeam;
        } else if (nextMatch.teamB.id === "TBD") {
          nextMatch.teamB = advancingTeam;
        }
      }
    }

    // Try to move to next eligible match
    const next = this.startNextMatch();
    if (!next) {
      // No next match ready; clear currentMatchId
      if (this.tournament) this.tournament.currentMatchId = null;

      // If all matches finished or no playable matches remain, end tournament
      const anyPlayable = this.tournament.matches.some(
        (m) =>
          m.phase !== "FINISHED" && m.teamA.id !== "TBD" && m.teamB.id !== "TBD"
      );
      if (!anyPlayable) {
        this.endTournament();
      }
    }

    return match;
  }

  updateMatchRounds(rounds: number) {
    const match = this.getCurrentMatch();
    if (!match) throw new Error("No active match");
    match.totalRounds = rounds;
    return match;
  }

  endTournament() {
    if (!this.tournament) throw new Error("No tournament");
    this.tournament.status = "FINISHED";
    return this.tournament;
  }

  private timerInterval: ReturnType<typeof setTimeout> | null = null;
  private io: any = null; // Need IO to emit updates

  setIO(io: any) {
    this.io = io;
  }

  // --- Timer Logic ---

  startTimer(duration: number) {
    const match = this.getCurrentMatch();
    if (!match) return;

    if (this.timerInterval) clearInterval(this.timerInterval);

    match.timer = duration;
    match.timerRunning = true;

    this.timerInterval = setInterval(() => {
      if (!match.timer || match.timer <= 0) {
        this.stopTimer();
        if (this.io) this.io.emit("timer:end");
        return;
      }
      match.timer--;
      if (this.io) this.io.emit("timer:update", match.timer);
    }, 1000);

    return match;
  }

  stopTimer() {
    const match = this.getCurrentMatch();
    if (!match) return;

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    match.timerRunning = false;
    return match;
  }

  addTime(seconds: number) {
    const match = this.getCurrentMatch();
    if (!match || match.timer === null) return;

    match.timer += seconds;
    if (this.io) this.io.emit("timer:update", match.timer);
    return match;
  }

  // --- Match Logic ---

  startMatch() {
    const match = this.getCurrentMatch();
    if (!match) return;

    // Always start with BUZZER phase
    // If buzzer disabled, GM will select team (like judging buzzer)
    // If buzzer enabled, players compete with buzzer
    match.phase = "BUZZER";
    match.currentQuestion = null;

    return match;
  }

  handleBuzzer(teamId: string) {
    const match = this.getCurrentMatch();
    if (!match || match.phase !== "BUZZER" || match.buzzerLocked) return;

    match.buzzerLocked = true;
    match.buzzerWinnerId = teamId;
    // Stop timer if running when buzzer is hit?
    // Usually yes for buzzer rounds.
    if (match.timerRunning) this.stopTimer();

    return match;
  }

  judgeBuzzer(winnerTeamId: string | null) {
    const match = this.getCurrentMatch();
    if (!match || match.phase !== "BUZZER") return;

    if (winnerTeamId) {
      match.currentTurnTeamId = winnerTeamId;
      match.answeringTeamId = null;
      // Winner chooses category first, then TRUTH or DARE
      match.availableOptions = this.getRandomOptions(3);
      match.phase = "CATEGORY_SELECT";
      // Increment round counter for the first turn (after buzzer)
      match.currentRound = 1;
    } else {
      // Wrong answer / both wrong
      match.buzzerLocked = false;
      match.buzzerWinnerId = null;
      // Maybe reset buzzer?
    }
    return match;
  }

  // Player selects answer from multiple choice
  selectAnswer(answer: string) {
    const match = this.getCurrentMatch();
    if (!match || match.phase !== "ANSWER_SELECT") return;

    match.selectedAnswer = answer;

    // Auto-check the answer
    if (match.currentQuestion && match.currentQuestion.answer) {
      match.isAnswerCorrect =
        answer.trim().toLowerCase() ===
        match.currentQuestion.answer.trim().toLowerCase();
    }

    // Move to approval phase for GM to confirm
    match.phase = "ANSWER_APPROVAL";
    return match;
  }

  // GM approves the answer and applies scoring
  approveAnswer(approved: boolean) {
    const match = this.getCurrentMatch();
    if (!match || match.phase !== "ANSWER_APPROVAL") return;

    const isCorrect = approved && match.isAnswerCorrect;
    const questionPoints = match.currentQuestion?.points || 100;

    if (match.currentCardType === "question") {
      // TRUTH: Team answers their own question
      // Correct = 100% points, Wrong = 0 points
      if (isCorrect && match.currentTurnTeamId) {
        if (match.currentTurnTeamId === match.teamA.id) {
          match.teamA.score += questionPoints;
        } else {
          match.teamB.score += questionPoints;
        }
      }
    } else if (match.currentCardType === "dare") {
      // DARE: Question to opponent team
      // Opponent correct = opponent gets 50%, Opponent wrong = original team gets 50%
      const halfPoints = Math.floor(questionPoints / 2);

      if (isCorrect && match.answeringTeamId) {
        // Opponent answered correctly - they get 50%
        if (match.answeringTeamId === match.teamA.id) {
          match.teamA.score += halfPoints;
        } else {
          match.teamB.score += halfPoints;
        }
      } else if (!isCorrect && match.currentTurnTeamId) {
        // Opponent answered wrong - original team gets 50%
        if (match.currentTurnTeamId === match.teamA.id) {
          match.teamA.score += halfPoints;
        } else {
          match.teamB.score += halfPoints;
        }
      }
    }

    // Move to SCORING phase instead of immediately advancing
    match.phase = "SCORING";

    return match;
  }

  nextRound() {
    const match = this.getCurrentMatch();
    if (!match || match.phase !== "SCORING") return;

    // Increment round counter first
    match.currentRound++;

    // Check if match should end after incrementing
    if (match.currentRound > match.totalRounds) {
      this.endMatch(match.id);
      return match;
    }

    // Switch turns and prepare for next round
    // Alternate to the other team
    const nextTurnTeamId =
      match.currentTurnTeamId === match.teamA.id
        ? match.teamB.id
        : match.teamA.id;

    match.currentTurnTeamId = nextTurnTeamId;
    match.answeringTeamId = null;
    match.selectedOption = null;
    match.selectedAnswer = null;
    match.isAnswerCorrect = null;
    match.currentCard = null;
    match.currentQuestion = null;
    match.availableOptions = this.getRandomOptions(3);
    this.stopTimer();
    match.timer = null;

    // Go to category selection (no more buzzer after first round)
    match.phase = "CATEGORY_SELECT";

    return match;
  }

  // Used Cards Tracking
  private usedCardIds: Set<string> = new Set();

  selectOption(option: { category: string; difficulty: string }) {
    const match = this.getCurrentMatch();
    if (!match || match.phase !== "CATEGORY_SELECT") return;

    match.selectedOption = option;

    // Don't select card yet - go to strategy selection first!
    // Players will choose TRUTH or DARE, then we'll select appropriate card
    match.phase = "STRATEGY_SELECT";

    return match;
  }

  selectStrategy(strategy: "TRUTH" | "DARE") {
    const match = this.getCurrentMatch();
    if (!match || match.phase !== "STRATEGY_SELECT") return;

    match.selectedStrategy = strategy;

    // Now select the card based on the chosen strategy
    if (!match.selectedOption) return;

    // Try to get a card matching: category + difficulty + type
    let finalCard = cardService.getByCategoryDifficultyAndTypeExclude(
      match.selectedOption.category,
      match.selectedOption.difficulty,
      strategy,
      Array.from(this.usedCardIds)
    );

    // Fallback 1: try category + type (ignore difficulty)
    if (!finalCard) {
      finalCard = cardService.getByCategoryAndTypeExclude(
        match.selectedOption.category,
        strategy,
        Array.from(this.usedCardIds)
      );
    }

    // Fallback 2: allow duplicates if exhausted
    if (!finalCard) {
      finalCard = cardService.getByCategoryDifficultyAndTypeExclude(
        match.selectedOption.category,
        match.selectedOption.difficulty,
        strategy,
        [] // Allow any card
      );
    }

    if (finalCard) {
      this.usedCardIds.add(finalCard.id);

      if (strategy === "TRUTH") {
        // TRUTH strategy: Player answers their own question
        match.currentQuestion = {
          ...finalCard,
          choices: finalCard.answers || [],
          answer: finalCard.correctAnswer,
        };
        match.currentCard = null;
        match.currentCardType = "question";
        match.answeringTeamId = match.currentTurnTeamId; // Self-play

        if (this.tournament?.defaultQuestionTime) {
          this.startTimer(this.tournament.defaultQuestionTime);
        }
        match.phase = "ANSWER_SELECT";
      } else {
        // DARE strategy: Player performs dare action
        match.currentCard = finalCard;
        match.currentQuestion = null;
        match.currentCardType = "dare";
        // For DARE, player chooses to do it themselves,
        // so answeringTeamId is the current turn team
        match.answeringTeamId = match.currentTurnTeamId;

        match.phase = "REVEAL";
      }
    }

    return match;
  }

  confirmReveal() {
    const match = this.getCurrentMatch();
    if (!match || match.phase !== "REVEAL") return;

    // Start timer for dare card
    if (match.currentCardType === "dare" && this.tournament?.defaultDareTime) {
      this.startTimer(this.tournament.defaultDareTime);
    }

    match.phase = "ACTION"; // Doing the task
    return match;
  }

  // GM scores the action
  scoreAction(success: boolean) {
    const match = this.getCurrentMatch();
    if (!match || match.phase !== "ACTION") return;

    // DARE Scoring
    if (match.currentCard && match.currentCardType === "dare") {
      const fullPoints = match.currentCard.points;
      const halfPoints = Math.floor(fullPoints / 2);

      // Check if Self-Play or Challenge
      const isSelfPlay = match.answeringTeamId === match.currentTurnTeamId;

      if (isSelfPlay) {
        // Self-Play: Full points if success, 0 if fail
        if (success) {
          if (match.answeringTeamId === match.teamA.id) {
            match.teamA.score += fullPoints;
          } else {
            match.teamB.score += fullPoints;
          }
        }
      } else {
        // Challenge: 50% points
        // If success, answering team (opponent) gets points
        // If fail, challenger (currentTurnTeam) gets points
        const challengerTeamId =
          match.answeringTeamId === match.teamA.id
            ? match.teamB.id
            : match.teamA.id;

        if (success) {
          if (match.answeringTeamId === match.teamA.id) {
            match.teamA.score += halfPoints;
          } else {
            match.teamB.score += halfPoints;
          }
        } else {
          if (challengerTeamId === match.teamA.id) {
            match.teamA.score += halfPoints;
          } else {
            match.teamB.score += halfPoints;
          }
        }
      }

      match.isAnswerCorrect = success;
    }

    // Move to SCORING phase
    match.phase = "SCORING";

    return match;
  }
}

export const gameManager = new GameManager();
