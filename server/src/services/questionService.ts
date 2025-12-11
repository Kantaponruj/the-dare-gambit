import { v4 as uuidv4 } from "uuid";

export interface Question {
  id: string;
  category: string;
  text: string;
  answer: string;
  choices: string[]; // Multiple choice options
  points: number;
}

class QuestionService {
  private questions: Question[] = [
    // General
    {
      id: uuidv4(),
      category: "General",
      text: "What is the capital of France?",
      answer: "Paris",
      choices: ["London", "Paris", "Berlin", "Madrid"],
      points: 100,
    },
    {
      id: uuidv4(),
      category: "General",
      text: "How many continents are there?",
      answer: "7",
      choices: ["5", "6", "7", "8"],
      points: 100,
    },
    // Music
    {
      id: uuidv4(),
      category: "Music",
      text: "Who is known as the King of Pop?",
      answer: "Michael Jackson",
      choices: ["Elvis Presley", "Michael Jackson", "Prince", "Madonna"],
      points: 150,
    },
    {
      id: uuidv4(),
      category: "Music",
      text: "Which band released the album 'Abbey Road'?",
      answer: "The Beatles",
      choices: [
        "The Rolling Stones",
        "The Beatles",
        "Led Zeppelin",
        "Pink Floyd",
      ],
      points: 150,
    },
    // Movies
    {
      id: uuidv4(),
      category: "Movies",
      text: "Who directed 'Jurassic Park'?",
      answer: "Steven Spielberg",
      choices: [
        "James Cameron",
        "Steven Spielberg",
        "George Lucas",
        "Peter Jackson",
      ],
      points: 200,
    },
    {
      id: uuidv4(),
      category: "Movies",
      text: "What is the name of the hobbit played by Elijah Wood?",
      answer: "Frodo Baggins",
      choices: [
        "Bilbo Baggins",
        "Frodo Baggins",
        "Samwise Gamgee",
        "Merry Brandybuck",
      ],
      points: 200,
    },
    // Science
    {
      id: uuidv4(),
      category: "Science",
      text: "What is the chemical symbol for Gold?",
      answer: "Au",
      choices: ["Go", "Au", "Gd", "Ag"],
      points: 250,
    },
    {
      id: uuidv4(),
      category: "Science",
      text: "What planet is known as the Red Planet?",
      answer: "Mars",
      choices: ["Venus", "Mars", "Jupiter", "Saturn"],
      points: 150,
    },
    // History
    {
      id: uuidv4(),
      category: "History",
      text: "Who was the first President of the United States?",
      answer: "George Washington",
      choices: [
        "Thomas Jefferson",
        "George Washington",
        "John Adams",
        "Benjamin Franklin",
      ],
      points: 200,
    },
    {
      id: uuidv4(),
      category: "History",
      text: "In which year did World War II end?",
      answer: "1945",
      choices: ["1943", "1944", "1945", "1946"],
      points: 300,
    },
  ];

  getAll() {
    return this.questions;
  }

  add(question: Omit<Question, "id">) {
    const newQuestion = { ...question, id: uuidv4() };
    this.questions.push(newQuestion);
    return newQuestion;
  }

  delete(id: string) {
    this.questions = this.questions.filter((q) => q.id !== id);
  }

  getRandom(): Question | null {
    if (this.questions.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * this.questions.length);
    return this.questions[randomIndex];
  }

  getByCategory(category: string): Question | null {
    const filtered = this.questions.filter((q) => q.category === category);
    if (filtered.length === 0) {
      // Fallback to random if no questions in category
      return this.getRandom();
    }
    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex];
  }
}

export const questionService = new QuestionService();
