import {
  users, places, threads, comments, favorites,
  type User, type InsertUser,
  type Place, type InsertPlace,
  type Thread, type InsertThread,
  type Comment, type InsertComment,
  type Favorite, type InsertFavorite
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserAllergies(userId: number, allergies: string[]): Promise<User | undefined>;
  
  // Place methods
  getAllPlaces(): Promise<Place[]>;
  getPlaceById(id: number): Promise<Place | undefined>;
  getPlacesByCoordinates(lat: number, lng: number, radius: number): Promise<Place[]>;
  createPlace(place: InsertPlace): Promise<Place>;
  updatePlaceRating(placeId: number, newRating: number): Promise<Place | undefined>;
  
  // Thread methods
  getAllThreads(): Promise<Thread[]>;
  getThreadById(id: number): Promise<Thread | undefined>;
  createThread(thread: InsertThread): Promise<Thread>;
  updateThreadLikeCount(threadId: number, increment: boolean): Promise<Thread | undefined>;
  updateThreadCommentCount(threadId: number, increment: boolean): Promise<Thread | undefined>;
  
  // Comment methods
  getCommentsByThreadId(threadId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Favorite methods
  getFavoritesByUserId(userId: number): Promise<Favorite[]>;
  getFavoritePlacesByUserId(userId: number): Promise<Place[]>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(userId: number, placeId: number): Promise<boolean>;
  checkIsFavorite(userId: number, placeId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserAllergies(userId: number, allergies: string[]): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ allergies })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  // Place methods
  async getAllPlaces(): Promise<Place[]> {
    return await db.select().from(places);
  }

  async getPlaceById(id: number): Promise<Place | undefined> {
    const [place] = await db.select().from(places).where(eq(places.id, id));
    return place;
  }

  async getPlacesByCoordinates(lat: number, lng: number, radius: number): Promise<Place[]> {
    // Calculate a rough bounding box for faster filtering
    // 1 degree is approximately 111 km
    const radiusDegrees = radius / 111;
    
    // Using a simplified version for now - in a production app, we'd use PostGIS
    return await db.select().from(places).where(
      and(
        sql`${places.latitude} BETWEEN ${lat - radiusDegrees} AND ${lat + radiusDegrees}`,
        sql`${places.longitude} BETWEEN ${lng - radiusDegrees} AND ${lng + radiusDegrees}`
      )
    );
  }

  async createPlace(insertPlace: InsertPlace): Promise<Place> {
    const [place] = await db.insert(places).values(insertPlace).returning();
    return place;
  }

  async updatePlaceRating(placeId: number, newRating: number): Promise<Place | undefined> {
    const [updatedPlace] = await db
      .update(places)
      .set({ rating: newRating })
      .where(eq(places.id, placeId))
      .returning();
    return updatedPlace;
  }

  // Thread methods
  async getAllThreads(): Promise<Thread[]> {
    return await db
      .select()
      .from(threads)
      .orderBy(sql`${threads.createdAt} DESC`);
  }

  async getThreadById(id: number): Promise<Thread | undefined> {
    const [thread] = await db.select().from(threads).where(eq(threads.id, id));
    return thread;
  }

  async createThread(insertThread: InsertThread): Promise<Thread> {
    const [thread] = await db
      .insert(threads)
      .values({
        ...insertThread,
        likeCount: 0,
        commentCount: 0
      })
      .returning();
    return thread;
  }

  async updateThreadLikeCount(threadId: number, increment: boolean): Promise<Thread | undefined> {
    // Use SQL expression to increment or decrement
    const expression = increment
      ? sql`${threads.likeCount} + 1`
      : sql`GREATEST(0, ${threads.likeCount} - 1)`;
    
    const [updatedThread] = await db
      .update(threads)
      .set({ likeCount: expression })
      .where(eq(threads.id, threadId))
      .returning();
    
    return updatedThread;
  }

  async updateThreadCommentCount(threadId: number, increment: boolean): Promise<Thread | undefined> {
    // Use SQL expression to increment or decrement
    const expression = increment
      ? sql`${threads.commentCount} + 1`
      : sql`GREATEST(0, ${threads.commentCount} - 1)`;
    
    const [updatedThread] = await db
      .update(threads)
      .set({ commentCount: expression })
      .where(eq(threads.id, threadId))
      .returning();
    
    return updatedThread;
  }

  // Comment methods
  async getCommentsByThreadId(threadId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.threadId, threadId))
      .orderBy(sql`${comments.createdAt} ASC`);
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values({
        ...insertComment,
        likeCount: 0
      })
      .returning();
    
    // Update thread comment count
    await this.updateThreadCommentCount(insertComment.threadId, true);
    
    return comment;
  }

  // Favorite methods
  async getFavoritesByUserId(userId: number): Promise<Favorite[]> {
    return await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, userId));
  }

  async getFavoritePlacesByUserId(userId: number): Promise<Place[]> {
    // Join favorites with places to get the favorite places
    return await db
      .select({
        id: places.id,
        name: places.name,
        description: places.description,
        imageUrl: places.imageUrl,
        latitude: places.latitude,
        longitude: places.longitude,
        address: places.address,
        allergyFeatures: places.allergyFeatures,
        allergySafe: places.allergySafe,
        rating: places.rating,
        createdAt: places.createdAt
      })
      .from(places)
      .innerJoin(favorites, eq(places.id, favorites.placeId))
      .where(eq(favorites.userId, userId));
  }

  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    // Check if already a favorite
    const exists = await this.checkIsFavorite(insertFavorite.userId, insertFavorite.placeId);
    if (exists) {
      throw new Error("Already in favorites");
    }
    
    const [favorite] = await db
      .insert(favorites)
      .values(insertFavorite)
      .returning();
    
    return favorite;
  }

  async deleteFavorite(userId: number, placeId: number): Promise<boolean> {
    // First check if the favorite exists
    const exists = await this.checkIsFavorite(userId, placeId);
    if (!exists) return false;
    
    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.placeId, placeId)
        )
      );
    
    return true;
  }

  async checkIsFavorite(userId: number, placeId: number): Promise<boolean> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.placeId, placeId)
        )
      );
    
    return result.count > 0;
  }
}

// Export an instance of the database storage
export const storage = new DatabaseStorage();
