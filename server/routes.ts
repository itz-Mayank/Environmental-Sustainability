import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertAlertSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Environmental data endpoints
  app.get("/api/environmental/aqi", async (req, res) => {
    try {
      const data = await storage.getEnvironmentalData("aqi");
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AQI data" });
    }
  });

  app.get("/api/environmental/water", async (req, res) => {
    try {
      const data = await storage.getEnvironmentalData("water");
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch water quality data" });
    }
  });

  app.get("/api/environmental/weather", async (req, res) => {
    try {
      const data = await storage.getEnvironmentalData("weather");
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  // Alert management
  app.post("/api/alerts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const alertData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert({
        ...alertData,
        userId: req.user!.id,
      });
      res.status(201).json(alert);
    } catch (error) {
      res.status(400).json({ error: "Invalid alert data" });
    }
  });

  app.get("/api/alerts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const alerts = await storage.getAlertsByUser(req.user!.id);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
