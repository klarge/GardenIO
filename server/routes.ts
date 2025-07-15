import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertPlantSchema, insertPlantingSchema, insertLocationSchema, insertGardenSchema, insertGardenCollaboratorSchema, harvestPlantingSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";

// Set up multer for file uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Serve uploaded images
  app.use('/uploads', express.static(uploadsDir));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Image upload endpoint
  app.post('/api/upload-image', upload.single('image'), (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  });

  // Garden routes
  app.get("/api/gardens", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const gardens = await storage.getGardensForUser(req.user.id);
      res.json(gardens);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gardens" });
    }
  });

  app.get("/api/gardens/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const id = parseInt(req.params.id);
      const garden = await storage.getGarden(id);
      if (!garden) {
        return res.status(404).json({ message: "Garden not found" });
      }
      res.json(garden);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch garden" });
    }
  });

  app.post("/api/gardens", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const gardenData = insertGardenSchema.parse(req.body);
      const garden = await storage.createGarden(gardenData, req.user.id);
      res.status(201).json(garden);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid garden data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create garden" });
    }
  });

  app.put("/api/gardens/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const id = parseInt(req.params.id);
      const gardenData = insertGardenSchema.partial().parse(req.body);
      const garden = await storage.updateGarden(id, gardenData);
      if (!garden) {
        return res.status(404).json({ message: "Garden not found" });
      }
      res.json(garden);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid garden data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update garden" });
    }
  });

  app.delete("/api/gardens/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteGarden(id);
      if (!deleted) {
        return res.status(404).json({ message: "Garden not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete garden" });
    }
  });

  // Collaborator routes
  app.post("/api/gardens/:id/collaborators", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const gardenId = parseInt(req.params.id);
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const collaborator = await storage.addCollaborator(gardenId, userId);
      res.status(201).json(collaborator);
    } catch (error) {
      res.status(500).json({ message: "Failed to add collaborator" });
    }
  });

  app.delete("/api/gardens/:id/collaborators/:userId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const gardenId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);
      const removed = await storage.removeCollaborator(gardenId, userId);
      if (!removed) {
        return res.status(404).json({ message: "Collaborator not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove collaborator" });
    }
  });

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
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const gardenId = parseInt(req.query.gardenId as string);
      if (!gardenId) {
        return res.status(400).json({ message: "Garden ID is required" });
      }
      const plantings = await storage.getPlantings(gardenId);
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
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const plantingData = insertPlantingSchema.parse(req.body);
      const planting = await storage.createPlanting(plantingData, req.user!.id);
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

  app.post("/api/plantings/:id/harvest", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const id = parseInt(req.params.id);
      const harvestData = harvestPlantingSchema.parse(req.body);
      const planting = await storage.harvestPlanting(id, harvestData);
      if (!planting) {
        return res.status(404).json({ message: "Planting not found" });
      }
      res.json(planting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid harvest data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to harvest planting" });
    }
  });

  // Location routes
  app.get("/api/locations", async (req, res) => {
    try {
      const gardenId = parseInt(req.query.gardenId as string);
      if (!gardenId) {
        return res.status(400).json({ message: "Garden ID is required" });
      }
      const locations = await storage.getLocations(gardenId);
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  app.get("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const location = await storage.getLocation(id);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      res.json(location);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch location" });
    }
  });

  app.post("/api/locations", async (req, res) => {
    try {
      const locationData = insertLocationSchema.parse(req.body);
      const location = await storage.createLocation(locationData);
      res.status(201).json(location);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid location data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create location" });
    }
  });

  app.put("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const locationData = insertLocationSchema.partial().parse(req.body);
      const location = await storage.updateLocation(id, locationData);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      res.json(location);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid location data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update location" });
    }
  });

  app.delete("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteLocation(id);
      if (!deleted) {
        return res.status(404).json({ message: "Location not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete location" });
    }
  });

  // Dashboard stats
  app.get("/api/stats", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const gardenId = parseInt(req.query.gardenId as string);
      if (!gardenId) {
        return res.status(400).json({ message: "Garden ID is required" });
      }
      const stats = await storage.getStats(gardenId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
