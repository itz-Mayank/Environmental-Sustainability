import { users, type User, type InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getEnvironmentalData(type: string): Promise<any>;
  createAlert(data: { type: string; threshold: number; userId: number }): Promise<any>;
  getAlertsByUser(userId: number): Promise<any[]>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private alerts: Map<number, any>;
  private environmentalData: Map<string, any>;
  currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.alerts = new Map();
    this.environmentalData = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });

    // Initialize with some mock environmental data
    this.environmentalData.set('aqi', {
      value: 45,
      pm25: 12,
      pm10: 25,
      timestamp: new Date()
    });

    this.environmentalData.set('water', {
      ph: 7.2,
      turbidity: 1.5,
      dissolvedOxygen: 8.5,
      timestamp: new Date()
    });

    this.environmentalData.set('weather', {
      daily: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        temp: Math.round(20 + Math.random() * 10),
        condition: ['Sunny', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 3)]
      }))
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id, isAdmin: false };
    this.users.set(id, user);
    return user;
  }

  async getEnvironmentalData(type: string): Promise<any> {
    return this.environmentalData.get(type);
  }

  async createAlert(data: { type: string; threshold: number; userId: number }): Promise<any> {
    const id = this.currentId++;
    const alert = {
      id,
      ...data,
      active: true,
      createdAt: new Date()
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async getAlertsByUser(userId: number): Promise<any[]> {
    return Array.from(this.alerts.values())
      .filter(alert => alert.userId === userId);
  }
}

export const storage = new MemStorage();