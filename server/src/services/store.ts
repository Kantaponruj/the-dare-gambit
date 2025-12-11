import { User, Tournament } from "../types/index.js";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

// In-memory demo store. Replace with DB in production.
const users: User[] = [];
const tournaments: Tournament[] = [];

// Seed a demo user
const seedUser = () => {
  if (!users.find((u) => u.username === "admin")) {
    const passwordHash = bcrypt.hashSync("password", 10);
    users.push({ id: randomUUID(), username: "admin", passwordHash });
  }
};
seedUser();

export const findUserByUsername = (username: string) =>
  users.find((u) => u.username === username);
export const findUserById = (id: string) => users.find((u) => u.id === id);

export const createTournament = (
  name: string,
  ownerUserId: string
): Tournament => {
  const t: Tournament = {
    id: randomUUID(),
    name,
    ownerUserId,
    createdAt: new Date().toISOString(),
  };
  tournaments.push(t);
  return t;
};

export const listTournaments = () => tournaments.slice();
export const getTournament = (id: string) =>
  tournaments.find((t) => t.id === id);
