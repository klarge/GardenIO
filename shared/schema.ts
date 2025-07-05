import { pgTable, text, serial, integer, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const plantings = pgTable("plantings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
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

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPlantingSchema = createInsertSchema(plantings).omit({
  id: true,
  status: true,
  userId: true,
});

export type InsertPlant = z.infer<typeof insertPlantSchema>;
export type Plant = typeof plants.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPlanting = z.infer<typeof insertPlantingSchema>;
export type Planting = typeof plantings.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  plantings: many(plantings),
}));

export const plantingsRelations = relations(plantings, ({ one }) => ({
  user: one(users, {
    fields: [plantings.userId],
    references: [users.id],
  }),
  plant: one(plants, {
    fields: [plantings.plantId],
    references: [plants.id],
  }),
}));

// Extended type for plantings with plant details
export interface PlantingWithPlant extends Planting {
  plant: Plant;
}
