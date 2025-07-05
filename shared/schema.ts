import { pgTable, text, serial, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const plants = pgTable("plants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // vegetable, herb, fruit
  daysToSprout: integer("days_to_sprout").notNull(),
  daysToHarvest: integer("days_to_harvest").notNull(),
  season: text("season").notNull(),
  imageUrl: text("image_url"),
});

export const plantings = pgTable("plantings", {
  id: serial("id").primaryKey(),
  plantId: integer("plant_id").notNull(),
  location: text("location").notNull(),
  plantedDate: date("planted_date").notNull(),
  quantity: integer("quantity").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("planted"), // planted, sprouting, growing, ready, harvested
});

export const insertPlantSchema = createInsertSchema(plants).omit({
  id: true,
});

export const insertPlantingSchema = createInsertSchema(plantings).omit({
  id: true,
  status: true,
});

export type InsertPlant = z.infer<typeof insertPlantSchema>;
export type Plant = typeof plants.$inferSelect;
export type InsertPlanting = z.infer<typeof insertPlantingSchema>;
export type Planting = typeof plantings.$inferSelect;

// Extended type for plantings with plant details
export interface PlantingWithPlant extends Planting {
  plant: Plant;
}
