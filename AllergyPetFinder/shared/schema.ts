import { pgTable, text, serial, integer, boolean, jsonb, real, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  allergies: text("allergies").array(), // Storing allergies as an array of strings
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User relations will be defined after all tables

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Place table for pet-friendly locations
export const places = pgTable("places", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  address: text("address").notNull(),
  allergyFeatures: text("allergy_features").array(), // Features like "Peanut-Free", "Gluten-Free Options"
  allergySafe: boolean("allergy_safe").notNull().default(false),
  rating: real("rating"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPlaceSchema = createInsertSchema(places).omit({
  id: true,
  rating: true,
  createdAt: true,
});

// Threads table for community discussions
export const threads = pgTable("threads", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  userId: integer("user_id").notNull(),
  likeCount: integer("like_count").notNull().default(0),
  commentCount: integer("comment_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertThreadSchema = createInsertSchema(threads).omit({
  id: true,
  likeCount: true,
  commentCount: true,
  createdAt: true,
});

// Comments table for thread discussions
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  threadId: integer("thread_id").notNull(),
  userId: integer("user_id").notNull(),
  likeCount: integer("like_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  likeCount: true,
  createdAt: true,
});

// Favorites table to store user favorite places
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  placeId: integer("place_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

// Types export
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Place = typeof places.$inferSelect;
export type InsertPlace = z.infer<typeof insertPlaceSchema>;

export type Thread = typeof threads.$inferSelect;
export type InsertThread = z.infer<typeof insertThreadSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

// Define relations after all tables are defined
export const usersRelations = relations(users, ({ many }) => ({
  threads: many(threads),
  comments: many(comments),
  favorites: many(favorites),
}));

export const placesRelations = relations(places, ({ many }) => ({
  favorites: many(favorites),
}));

export const threadsRelations = relations(threads, ({ one, many }) => ({
  user: one(users, {
    fields: [threads.userId],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  thread: one(threads, {
    fields: [comments.threadId],
    references: [threads.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  place: one(places, {
    fields: [favorites.placeId],
    references: [places.id],
  }),
}));
