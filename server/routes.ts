import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlantSchema, insertPlantingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Plant routes
  app.get("/api/plants", async (req, res) => {
    try {
      const plants = await storage.getPlants();
      res.json(plants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plants" });
    }
  });

  app.get("/api/plants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const plant = await storage.getPlant(id);
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }
      res.json(plant);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plant" });
    }
  });

  app.post("/api/plants", async (req, res) => {
    try {
      const plantData = insertPlantSchema.parse(req.body);
      const plant = await storage.createPlant(plantData);
      res.status(201).json(plant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid plant data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create plant" });
    }
  });

  app.put("/api/plants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const plantData = insertPlantSchema.partial().parse(req.body);
      const plant = await storage.updatePlant(id, plantData);
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }
      res.json(plant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid plant data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update plant" });
    }
  });

  app.delete("/api/plants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePlant(id);
      if (!deleted) {
        return res.status(404).json({ message: "Plant not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete plant" });
    }
  });

  // Planting routes
  app.get("/api/plantings", async (req, res) => {
    try {
      const plantings = await storage.getPlantings();
      res.json(plantings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plantings" });
    }
  });

  app.get("/api/plantings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const planting = await storage.getPlanting(id);
      if (!planting) {
        return res.status(404).json({ message: "Planting not found" });
      }
      res.json(planting);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch planting" });
    }
  });

  app.post("/api/plantings", async (req, res) => {
    try {
      const plantingData = insertPlantingSchema.parse(req.body);
      const planting = await storage.createPlanting(plantingData);
      res.status(201).json(planting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid planting data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create planting" });
    }
  });

  app.put("/api/plantings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const plantingData = insertPlantingSchema.partial().parse(req.body);
      const planting = await storage.updatePlanting(id, plantingData);
      if (!planting) {
        return res.status(404).json({ message: "Planting not found" });
      }
      res.json(planting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid planting data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update planting" });
    }
  });

  app.delete("/api/plantings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePlanting(id);
      if (!deleted) {
        return res.status(404).json({ message: "Planting not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete planting" });
    }
  });

  // Dashboard stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
