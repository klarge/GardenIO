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

export const gardens = pgTable("gardens", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: integer("owner_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gardenCollaborators = pgTable("garden_collaborators", {
  id: serial("id").primaryKey(),
  gardenId: integer("garden_id").notNull(),
  userId: integer("user_id").notNull(),
  role: text("role").notNull().default("collaborator"), // owner, collaborator
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  gardenId: integer("garden_id").notNull(),
});

export const plantings = pgTable("plantings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  plantId: integer("plant_id").notNull(),
  gardenId: integer("garden_id").notNull(),
  location: text("location").notNull(),
  plantedDate: date("planted_date").notNull(),
  quantity: integer("quantity").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("planted"), // planted, sprouting, growing, ready, harvested
  harvestedDate: date("harvested_date"),
  harvestedQuantity: integer("harvested_quantity"),
  harvestedNotes: text("harvested_notes"),
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

export const insertGardenSchema = createInsertSchema(gardens).omit({
  id: true,
  ownerId: true,
  createdAt: true,
});

export const insertGardenCollaboratorSchema = createInsertSchema(gardenCollaborators).omit({
  id: true,
  createdAt: true,
});

export const insertPlantingSchema = createInsertSchema(plantings).omit({
  id: true,
  status: true,
  userId: true,
  harvestedDate: true,
  harvestedQuantity: true,
  harvestedNotes: true,
});

export const harvestPlantingSchema = z.object({
  harvestedDate: z.string(),
  harvestedQuantity: z.number().min(0),
  harvestedNotes: z.string().optional(),
});

export type InsertPlant = z.infer<typeof insertPlantSchema>;
export type Plant = typeof plants.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertGarden = z.infer<typeof insertGardenSchema>;
export type Garden = typeof gardens.$inferSelect;
export type InsertGardenCollaborator = z.infer<typeof insertGardenCollaboratorSchema>;
export type GardenCollaborator = typeof gardenCollaborators.$inferSelect;
export type InsertPlanting = z.infer<typeof insertPlantingSchema>;
export type Planting = typeof plantings.$inferSelect;
export type HarvestPlanting = z.infer<typeof harvestPlantingSchema>;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  plantings: many(plantings),
  ownedGardens: many(gardens),
  gardenCollaborations: many(gardenCollaborators),
}));

export const gardensRelations = relations(gardens, ({ one, many }) => ({
  owner: one(users, {
    fields: [gardens.ownerId],
    references: [users.id],
  }),
  locations: many(locations),
  plantings: many(plantings),
  collaborators: many(gardenCollaborators),
}));

export const gardenColaboratorsRelations = relations(gardenCollaborators, ({ one }) => ({
  garden: one(gardens, {
    fields: [gardenCollaborators.gardenId],
    references: [gardens.id],
  }),
  user: one(users, {
    fields: [gardenCollaborators.userId],
    references: [users.id],
  }),
}));

export const locationsRelations = relations(locations, ({ one }) => ({
  garden: one(gardens, {
    fields: [locations.gardenId],
    references: [gardens.id],
  }),
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
  garden: one(gardens, {
    fields: [plantings.gardenId],
    references: [gardens.id],
  }),
}));

// Extended types for plantings with related data
export interface PlantingWithPlant extends Planting {
  plant: Plant;
}

export interface GardenWithCollaborators extends Garden {
  collaborators: (GardenCollaborator & { user: User })[];
}
