import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertPlaceSchema, 
  insertThreadSchema, 
  insertCommentSchema,
  insertFavoriteSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.patch("/api/users/:id/allergies", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { allergies } = req.body;
      
      if (!Array.isArray(allergies)) {
        return res.status(400).json({ message: "Allergies must be an array" });
      }
      
      const updatedUser = await storage.updateUserAllergies(userId, allergies);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update allergies" });
    }
  });

  // Places routes
  app.get("/api/places", async (req, res) => {
    try {
      const places = await storage.getAllPlaces();
      res.json(places);
    } catch (error) {
      res.status(500).json({ message: "Failed to get places" });
    }
  });

  app.get("/api/places/nearby", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const radius = parseFloat(req.query.radius as string) || 5; // Default 5km
      
      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ message: "Valid latitude and longitude required" });
      }
      
      const places = await storage.getPlacesByCoordinates(lat, lng, radius);
      res.json(places);
    } catch (error) {
      res.status(500).json({ message: "Failed to get nearby places" });
    }
  });

  app.get("/api/places/:id", async (req, res) => {
    try {
      const placeId = parseInt(req.params.id);
      const place = await storage.getPlaceById(placeId);
      
      if (!place) {
        return res.status(404).json({ message: "Place not found" });
      }
      
      res.json(place);
    } catch (error) {
      res.status(500).json({ message: "Failed to get place" });
    }
  });

  app.post("/api/places", async (req, res) => {
    try {
      const placeData = insertPlaceSchema.parse(req.body);
      const place = await storage.createPlace(placeData);
      res.status(201).json(place);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create place" });
    }
  });

  // Thread routes
  app.get("/api/threads", async (req, res) => {
    try {
      const threads = await storage.getAllThreads();
      res.json(threads);
    } catch (error) {
      res.status(500).json({ message: "Failed to get threads" });
    }
  });

  app.get("/api/threads/:id", async (req, res) => {
    try {
      const threadId = parseInt(req.params.id);
      const thread = await storage.getThreadById(threadId);
      
      if (!thread) {
        return res.status(404).json({ message: "Thread not found" });
      }
      
      res.json(thread);
    } catch (error) {
      res.status(500).json({ message: "Failed to get thread" });
    }
  });

  app.post("/api/threads", async (req, res) => {
    try {
      const threadData = insertThreadSchema.parse(req.body);
      const thread = await storage.createThread(threadData);
      res.status(201).json(thread);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create thread" });
    }
  });

  app.post("/api/threads/:id/like", async (req, res) => {
    try {
      const threadId = parseInt(req.params.id);
      const { increment } = req.body;
      
      if (typeof increment !== "boolean") {
        return res.status(400).json({ message: "Increment must be a boolean" });
      }
      
      const updatedThread = await storage.updateThreadLikeCount(threadId, increment);
      
      if (!updatedThread) {
        return res.status(404).json({ message: "Thread not found" });
      }
      
      res.json(updatedThread);
    } catch (error) {
      res.status(500).json({ message: "Failed to update like count" });
    }
  });

  // Comment routes
  app.get("/api/threads/:threadId/comments", async (req, res) => {
    try {
      const threadId = parseInt(req.params.threadId);
      const comments = await storage.getCommentsByThreadId(threadId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to get comments" });
    }
  });

  app.post("/api/threads/:threadId/comments", async (req, res) => {
    try {
      const threadId = parseInt(req.params.threadId);
      
      // Ensure thread exists
      const thread = await storage.getThreadById(threadId);
      if (!thread) {
        return res.status(404).json({ message: "Thread not found" });
      }
      
      const commentData = insertCommentSchema.parse({
        ...req.body,
        threadId,
      });
      
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Favorite routes
  app.get("/api/users/:userId/favorites", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const favoritePlaces = await storage.getFavoritePlacesByUserId(userId);
      res.json(favoritePlaces);
    } catch (error) {
      res.status(500).json({ message: "Failed to get favorites" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const favoriteData = insertFavoriteSchema.parse(req.body);
      
      try {
        const favorite = await storage.createFavorite(favoriteData);
        res.status(201).json(favorite);
      } catch (error) {
        if (error instanceof Error && error.message === "Already in favorites") {
          return res.status(400).json({ message: "Already in favorites" });
        }
        throw error;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites", async (req, res) => {
    try {
      const { userId, placeId } = req.body;
      
      if (typeof userId !== "number" || typeof placeId !== "number") {
        return res.status(400).json({ message: "UserId and placeId must be numbers" });
      }
      
      const success = await storage.deleteFavorite(userId, placeId);
      
      if (!success) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  app.get("/api/favorites/check", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const placeId = parseInt(req.query.placeId as string);
      
      if (isNaN(userId) || isNaN(placeId)) {
        return res.status(400).json({ message: "UserId and placeId must be numbers" });
      }
      
      const isFavorite = await storage.checkIsFavorite(userId, placeId);
      res.json({ isFavorite });
    } catch (error) {
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  // Create and return HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
