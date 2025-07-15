import { plants, plantings, locations, users, gardens, gardenCollaborators, type Plant, type InsertPlant, type Planting, type InsertPlanting, type PlantingWithPlant, type Location, type InsertLocation, type User, type InsertUser, type Garden, type InsertGarden, type GardenCollaborator, type InsertGardenCollaborator, type GardenWithCollaborators, type HarvestPlanting } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(id: number, hashedPassword: string): Promise<void>;
  
  // Plant operations
  getPlants(): Promise<Plant[]>;
  getPlant(id: number): Promise<Plant | undefined>;
  createPlant(plant: InsertPlant): Promise<Plant>;
  updatePlant(id: number, plant: Partial<InsertPlant>): Promise<Plant | undefined>;
  deletePlant(id: number): Promise<boolean>;
  
  // Garden operations
  getGardensForUser(userId: number): Promise<GardenWithCollaborators[]>;
  getGarden(gardenId: number): Promise<GardenWithCollaborators | undefined>;
  createGarden(garden: InsertGarden, ownerId: number): Promise<Garden>;
  updateGarden(gardenId: number, garden: Partial<InsertGarden>): Promise<Garden | undefined>;
  deleteGarden(gardenId: number): Promise<boolean>;
  
  // Collaborator operations
  addCollaborator(gardenId: number, userId: number): Promise<GardenCollaborator>;
  removeCollaborator(gardenId: number, userId: number): Promise<boolean>;
  getCollaborators(gardenId: number): Promise<(GardenCollaborator & { user: User })[]>;
  
  // Location operations
  getLocations(gardenId: number): Promise<Location[]>;
  getLocation(id: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined>;
  deleteLocation(id: number): Promise<boolean>;
  
  // Planting operations
  getPlantings(gardenId: number): Promise<PlantingWithPlant[]>;
  getPlanting(id: number): Promise<PlantingWithPlant | undefined>;
  createPlanting(planting: InsertPlanting, userId: number): Promise<PlantingWithPlant>;
  updatePlanting(id: number, planting: Partial<InsertPlanting>): Promise<PlantingWithPlant | undefined>;
  deletePlanting(id: number): Promise<boolean>;
  harvestPlanting(id: number, harvestData: HarvestPlanting): Promise<PlantingWithPlant | undefined>;
  
  // Dashboard stats
  getStats(gardenId: number): Promise<{
    activePlantings: number;
    readyHarvest: number;
    sproutingSoon: number;
    plantVarieties: number;
  }>;
  
  // Session store
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    try {
      // Check if we already have plants
      const existingPlants = await this.getPlants();
      if (existingPlants.length > 0) return;

      // Add sample plants
      const samplePlants = [
        {
          name: "Tomato - Cherry",
          description: "Small, sweet cherry tomatoes perfect for salads and snacking. Easy to grow and very productive.",
          category: "vegetable",
          daysToSprout: 10,
          daysToHarvest: 75,
          season: "Spring/Summer",
          imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop"
        },
        {
          name: "Lettuce - Romaine",
          description: "Crisp, tall heads of romaine lettuce with excellent flavor. Great for salads and wraps.",
          category: "vegetable",
          daysToSprout: 8,
          daysToHarvest: 60,
          season: "Spring/Fall",
          imageUrl: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&h=300&fit=crop"
        },
        {
          name: "Basil - Sweet",
          description: "Classic Italian basil with intense flavor and aroma. Perfect for cooking and making pesto.",
          category: "herb",
          daysToSprout: 7,
          daysToHarvest: 75,
          season: "Summer",
          imageUrl: "https://images.unsplash.com/photo-1607532941433-304659e8198a?w=400&h=300&fit=crop"
        },
        {
          name: "Radish - Cherry Belle",
          description: "Quick-growing, mild-flavored radishes perfect for beginners. Ready to harvest in just 30 days.",
          category: "vegetable",
          daysToSprout: 5,
          daysToHarvest: 30,
          season: "Spring/Fall",
          imageUrl: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400&h=300&fit=crop"
        },
        {
          name: "Spinach - Baby",
          description: "Tender baby spinach leaves perfect for salads and cooking. Cold-hardy and fast-growing.",
          category: "vegetable",
          daysToSprout: 6,
          daysToHarvest: 45,
          season: "Spring/Fall",
          imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop"
        },
        {
          name: "Carrot - Nantes",
          description: "Sweet, crisp carrots with excellent flavor. Great for fresh eating and storage.",
          category: "vegetable",
          daysToSprout: 12,
          daysToHarvest: 70,
          season: "Spring/Fall",
          imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop"
        }
      ];

      for (const plant of samplePlants) {
        await this.createPlant(plant);
      }

      // Create a default garden for the default user
      const defaultGarden = await this.createGarden({
        name: "My Garden",
        description: "Default garden for getting started"
      }, 1);

      // Add sample locations for the default garden
      const sampleLocations = [
        {
          name: "Front Garden",
          description: "Sunny spot near the front entrance, good for herbs and flowers",
          gardenId: defaultGarden.id
        },
        {
          name: "Back Yard",
          description: "Large area with full sun, perfect for vegetables",
          gardenId: defaultGarden.id
        },
        {
          name: "Greenhouse",
          description: "Temperature controlled environment for year-round growing",
          gardenId: defaultGarden.id
        },
        {
          name: "Kitchen Window",
          description: "Indoor herb garden on the windowsill",
          gardenId: defaultGarden.id
        },
      ];

      for (const location of sampleLocations) {
        await this.createLocation(location);
      }
    } catch (error) {
      console.log("Sample data initialization skipped:", error);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id));
  }

  // Garden operations
  async getGardensForUser(userId: number): Promise<GardenWithCollaborators[]> {
    const userGardens = await db.select().from(gardens).where(eq(gardens.ownerId, userId));
    const collaborativeGardens = await db.select({
      id: gardens.id,
      name: gardens.name,
      description: gardens.description,
      ownerId: gardens.ownerId,
      createdAt: gardens.createdAt,
    }).from(gardens)
      .innerJoin(gardenCollaborators, eq(gardens.id, gardenCollaborators.gardenId))
      .where(eq(gardenCollaborators.userId, userId));
    
    const allGardens = [...userGardens, ...collaborativeGardens];
    
    const result = [];
    for (const garden of allGardens) {
      const collaborators = await this.getCollaborators(garden.id);
      result.push({ ...garden, collaborators });
    }
    
    return result;
  }

  async getGarden(gardenId: number): Promise<GardenWithCollaborators | undefined> {
    const [garden] = await db.select().from(gardens).where(eq(gardens.id, gardenId));
    if (!garden) return undefined;
    
    const collaborators = await this.getCollaborators(gardenId);
    return { ...garden, collaborators };
  }

  async createGarden(insertGarden: InsertGarden, ownerId: number): Promise<Garden> {
    const [garden] = await db.insert(gardens).values({ ...insertGarden, ownerId }).returning();
    return garden;
  }

  async updateGarden(gardenId: number, updateGarden: Partial<InsertGarden>): Promise<Garden | undefined> {
    const [garden] = await db.update(gardens).set(updateGarden).where(eq(gardens.id, gardenId)).returning();
    return garden || undefined;
  }

  async deleteGarden(gardenId: number): Promise<boolean> {
    const result = await db.delete(gardens).where(eq(gardens.id, gardenId));
    return result.rowCount > 0;
  }

  // Collaborator operations
  async addCollaborator(gardenId: number, userId: number): Promise<GardenCollaborator> {
    const [collaborator] = await db.insert(gardenCollaborators).values({ gardenId, userId }).returning();
    return collaborator;
  }

  async removeCollaborator(gardenId: number, userId: number): Promise<boolean> {
    const result = await db.delete(gardenCollaborators)
      .where(eq(gardenCollaborators.gardenId, gardenId))
      .where(eq(gardenCollaborators.userId, userId));
    return result.rowCount > 0;
  }

  async getCollaborators(gardenId: number): Promise<(GardenCollaborator & { user: User })[]> {
    const collaborators = await db.select({
      id: gardenCollaborators.id,
      gardenId: gardenCollaborators.gardenId,
      userId: gardenCollaborators.userId,
      role: gardenCollaborators.role,
      createdAt: gardenCollaborators.createdAt,
      user: users,
    }).from(gardenCollaborators)
      .innerJoin(users, eq(gardenCollaborators.userId, users.id))
      .where(eq(gardenCollaborators.gardenId, gardenId));
    
    return collaborators;
  }

  // Plant operations
  async getPlants(): Promise<Plant[]> {
    return await db.select().from(plants);
  }

  async getPlant(id: number): Promise<Plant | undefined> {
    const [plant] = await db.select().from(plants).where(eq(plants.id, id));
    return plant || undefined;
  }

  async createPlant(insertPlant: InsertPlant): Promise<Plant> {
    const [plant] = await db.insert(plants).values(insertPlant).returning();
    return plant;
  }

  async updatePlant(id: number, updatePlant: Partial<InsertPlant>): Promise<Plant | undefined> {
    const [plant] = await db.update(plants).set(updatePlant).where(eq(plants.id, id)).returning();
    return plant || undefined;
  }

  async deletePlant(id: number): Promise<boolean> {
    const result = await db.delete(plants).where(eq(plants.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Location operations
  async getLocations(gardenId: number): Promise<Location[]> {
    return await db.select().from(locations).where(eq(locations.gardenId, gardenId));
  }

  async getLocation(id: number): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));
    return location || undefined;
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const [location] = await db.insert(locations).values(insertLocation).returning();
    return location;
  }

  async updateLocation(id: number, updateLocation: Partial<InsertLocation>): Promise<Location | undefined> {
    const [location] = await db.update(locations).set(updateLocation).where(eq(locations.id, id)).returning();
    return location || undefined;
  }

  async deleteLocation(id: number): Promise<boolean> {
    const result = await db.delete(locations).where(eq(locations.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Planting operations
  async getPlantings(gardenId: number): Promise<PlantingWithPlant[]> {
    const result = await db
      .select()
      .from(plantings)
      .leftJoin(plants, eq(plantings.plantId, plants.id))
      .where(eq(plantings.gardenId, gardenId));

    return result.map(row => ({
      ...row.plantings,
      plant: row.plants!
    }));
  }

  async getPlanting(id: number): Promise<PlantingWithPlant | undefined> {
    const [result] = await db
      .select()
      .from(plantings)
      .leftJoin(plants, eq(plantings.plantId, plants.id))
      .where(eq(plantings.id, id));

    if (!result) return undefined;

    return {
      ...result.plantings,
      plant: result.plants!
    };
  }

  async createPlanting(insertPlanting: InsertPlanting, userId: number): Promise<PlantingWithPlant> {
    const [planting] = await db.insert(plantings).values({
      ...insertPlanting,
      userId
    }).returning();

    const plant = await this.getPlant(planting.plantId);
    
    return {
      ...planting,
      plant: plant!
    };
  }

  async updatePlanting(id: number, updatePlanting: Partial<InsertPlanting>): Promise<PlantingWithPlant | undefined> {
    const [planting] = await db.update(plantings).set(updatePlanting).where(eq(plantings.id, id)).returning();
    
    if (!planting) return undefined;

    const plant = await this.getPlant(planting.plantId);
    
    return {
      ...planting,
      plant: plant!
    };
  }

  async deletePlanting(id: number): Promise<boolean> {
    const result = await db.delete(plantings).where(eq(plantings.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async harvestPlanting(id: number, harvestData: HarvestPlanting): Promise<PlantingWithPlant | undefined> {
    const [planting] = await db.update(plantings).set({
      status: "harvested",
      harvestedDate: harvestData.harvestedDate,
      harvestedQuantity: harvestData.harvestedQuantity,
      harvestedNotes: harvestData.harvestedNotes,
    }).where(eq(plantings.id, id)).returning();
    
    if (!planting) return undefined;

    const plant = await this.getPlant(planting.plantId);
    
    return {
      ...planting,
      plant: plant!
    };
  }

  // Dashboard stats
  async getStats(gardenId: number): Promise<{
    activePlantings: number;
    readyHarvest: number;
    sproutingSoon: number;
    plantVarieties: number;
  }> {
    const gardenPlantings = await this.getPlantings(gardenId);
    const now = new Date();

    const activePlantings = gardenPlantings.filter(p => p.status !== "harvested").length;
    
    const readyHarvest = gardenPlantings.filter(p => {
      const plantedDate = new Date(p.plantedDate);
      const daysSincePlanted = Math.floor((now.getTime() - plantedDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysSincePlanted >= p.plant.daysToHarvest && p.status !== "harvested";
    }).length;

    const sproutingSoon = gardenPlantings.filter(p => {
      const plantedDate = new Date(p.plantedDate);
      const daysSincePlanted = Math.floor((now.getTime() - plantedDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysSincePlanted >= p.plant.daysToSprout && daysSincePlanted < p.plant.daysToHarvest && p.status !== "harvested";
    }).length;

    const plantVarieties = new Set(gardenPlantings.map(p => p.plant.id)).size;

    return {
      activePlantings,
      readyHarvest,
      sproutingSoon,
      plantVarieties
    };
  }
}

export const storage = new DatabaseStorage();