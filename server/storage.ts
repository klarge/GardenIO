import { plants, plantings, locations, type Plant, type InsertPlant, type Planting, type InsertPlanting, type PlantingWithPlant, type Location, type InsertLocation } from "@shared/schema";

export interface IStorage {
  // Plant operations
  getPlants(): Promise<Plant[]>;
  getPlant(id: number): Promise<Plant | undefined>;
  createPlant(plant: InsertPlant): Promise<Plant>;
  updatePlant(id: number, plant: Partial<InsertPlant>): Promise<Plant | undefined>;
  deletePlant(id: number): Promise<boolean>;
  
  // Location operations
  getLocations(): Promise<Location[]>;
  getLocation(id: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined>;
  deleteLocation(id: number): Promise<boolean>;
  
  // Planting operations
  getPlantings(): Promise<PlantingWithPlant[]>;
  getPlanting(id: number): Promise<PlantingWithPlant | undefined>;
  createPlanting(planting: InsertPlanting): Promise<PlantingWithPlant>;
  updatePlanting(id: number, planting: Partial<InsertPlanting>): Promise<PlantingWithPlant | undefined>;
  deletePlanting(id: number): Promise<boolean>;
  
  // Dashboard stats
  getStats(): Promise<{
    activePlantings: number;
    readyHarvest: number;
    sproutingSoon: number;
    plantVarieties: number;
  }>;
}

export class MemStorage implements IStorage {
  private plants: Map<number, Plant>;
  private plantings: Map<number, Planting>;
  private locations: Map<number, Location>;
  private currentPlantId: number;
  private currentPlantingId: number;
  private currentLocationId: number;

  constructor() {
    this.plants = new Map();
    this.plantings = new Map();
    this.locations = new Map();
    this.currentPlantId = 1;
    this.currentPlantingId = 1;
    this.currentLocationId = 1;
    
    // Initialize with some sample plants and locations
    this.initializeSamplePlants();
    this.initializeSampleLocations();
  }

  private initializeSamplePlants() {
    const samplePlants: InsertPlant[] = [
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

    samplePlants.forEach(plant => {
      this.createPlant(plant);
    });
  }

  private initializeSampleLocations() {
    const sampleLocations: InsertLocation[] = [
      {
        name: "Front Garden",
        description: "Sunny spot near the front entrance, good for herbs and flowers",
      },
      {
        name: "Back Yard",
        description: "Large area with full sun, perfect for vegetables",
      },
      {
        name: "Greenhouse",
        description: "Temperature controlled environment for year-round growing",
      },
      {
        name: "Kitchen Window",
        description: "Indoor herb garden on the windowsill",
      },
    ];

    sampleLocations.forEach(location => {
      const id = this.currentLocationId++;
      this.locations.set(id, { 
        ...location, 
        id, 
        description: location.description || null 
      });
    });
  }

  async getPlants(): Promise<Plant[]> {
    return Array.from(this.plants.values());
  }

  async getPlant(id: number): Promise<Plant | undefined> {
    return this.plants.get(id);
  }

  async createPlant(insertPlant: InsertPlant): Promise<Plant> {
    const id = this.currentPlantId++;
    const plant: Plant = { 
      ...insertPlant, 
      id,
      imageUrl: insertPlant.imageUrl || null
    };
    this.plants.set(id, plant);
    return plant;
  }

  async updatePlant(id: number, updatePlant: Partial<InsertPlant>): Promise<Plant | undefined> {
    const plant = this.plants.get(id);
    if (!plant) return undefined;
    
    const updatedPlant = { ...plant, ...updatePlant };
    this.plants.set(id, updatedPlant);
    return updatedPlant;
  }

  async deletePlant(id: number): Promise<boolean> {
    return this.plants.delete(id);
  }

  // Location operations
  async getLocations(): Promise<Location[]> {
    return Array.from(this.locations.values());
  }

  async getLocation(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = this.currentLocationId++;
    const location: Location = { 
      ...insertLocation, 
      id,
      description: insertLocation.description || null
    };
    this.locations.set(id, location);
    return location;
  }

  async updateLocation(id: number, updateLocation: Partial<InsertLocation>): Promise<Location | undefined> {
    const location = this.locations.get(id);
    if (!location) return undefined;
    
    const updatedLocation = { ...location, ...updateLocation };
    this.locations.set(id, updatedLocation);
    return updatedLocation;
  }

  async deleteLocation(id: number): Promise<boolean> {
    return this.locations.delete(id);
  }

  async getPlantings(): Promise<PlantingWithPlant[]> {
    const plantingsArray = Array.from(this.plantings.values());
    const plantingsWithPlants: PlantingWithPlant[] = [];
    
    for (const planting of plantingsArray) {
      const plant = this.plants.get(planting.plantId);
      if (plant) {
        plantingsWithPlants.push({ ...planting, plant });
      }
    }
    
    return plantingsWithPlants;
  }

  async getPlanting(id: number): Promise<PlantingWithPlant | undefined> {
    const planting = this.plantings.get(id);
    if (!planting) return undefined;
    
    const plant = this.plants.get(planting.plantId);
    if (!plant) return undefined;
    
    return { ...planting, plant };
  }

  async createPlanting(insertPlanting: InsertPlanting): Promise<PlantingWithPlant> {
    const id = this.currentPlantingId++;
    const planting: Planting = { 
      ...insertPlanting, 
      id, 
      status: "planted",
      notes: insertPlanting.notes || null
    };
    this.plantings.set(id, planting);
    
    const plant = this.plants.get(planting.plantId)!;
    return { ...planting, plant };
  }

  async updatePlanting(id: number, updatePlanting: Partial<InsertPlanting>): Promise<PlantingWithPlant | undefined> {
    const planting = this.plantings.get(id);
    if (!planting) return undefined;
    
    const updatedPlanting = { ...planting, ...updatePlanting };
    this.plantings.set(id, updatedPlanting);
    
    const plant = this.plants.get(updatedPlanting.plantId)!;
    return { ...updatedPlanting, plant };
  }

  async deletePlanting(id: number): Promise<boolean> {
    return this.plantings.delete(id);
  }

  async getStats(): Promise<{
    activePlantings: number;
    readyHarvest: number;
    sproutingSoon: number;
    plantVarieties: number;
  }> {
    const plantings = Array.from(this.plantings.values());
    const today = new Date();
    
    let readyHarvest = 0;
    let sproutingSoon = 0;
    
    for (const planting of plantings) {
      const plant = this.plants.get(planting.plantId);
      if (!plant) continue;
      
      const plantedDate = new Date(planting.plantedDate);
      const daysSincePlanted = Math.floor((today.getTime() - plantedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSincePlanted >= plant.daysToHarvest) {
        readyHarvest++;
      } else if (daysSincePlanted < plant.daysToSprout && daysSincePlanted >= plant.daysToSprout - 3) {
        sproutingSoon++;
      }
    }
    
    return {
      activePlantings: plantings.length,
      readyHarvest,
      sproutingSoon,
      plantVarieties: this.plants.size
    };
  }
}

export const storage = new MemStorage();
