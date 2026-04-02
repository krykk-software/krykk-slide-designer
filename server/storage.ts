import { projects, snapshots, contactMessages, type Project, type InsertProject, type Snapshot, type InsertSnapshot, type ContactMessage, type InsertContactMessage } from "@shared/schema";
import { users, adminUsers, type User, type AdminUser } from "@shared/models/auth";
import { db } from "./db";
import { eq, and, desc, count, sql } from "drizzle-orm";

export interface IStorage {
  getProjectsByUser(userId: string): Promise<Project[]>;
  getProject(id: number, userId: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, userId: string, data: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number, userId: string): Promise<boolean>;

  getSnapshotsByProject(projectId: number, userId: string): Promise<Snapshot[]>;
  createSnapshot(snapshot: InsertSnapshot): Promise<Snapshot>;
  deleteSnapshot(id: number, userId: string): Promise<boolean>;

  deleteUserAndAllData(userId: string): Promise<boolean>;

  getAllUsers(): Promise<User[]>;
  getUserProjectCount(userId: string): Promise<number>;
  getUserSnapshotCount(userId: string): Promise<number>;
  setUserSuspended(userId: string, suspended: boolean): Promise<User | undefined>;
  deleteUserCascade(userId: string): Promise<boolean>;
  createInvitedUser(email: string): Promise<User>;

  getAdminByEmail(email: string): Promise<AdminUser | undefined>;
  createAdmin(email: string, passwordHash: string): Promise<AdminUser>;

  getUsersWithStats(): Promise<Array<User & { projectCount: number; snapshotCount: number }>>;
  updateLastLogin(userId: string): Promise<void>;

  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
}

class DatabaseStorage implements IStorage {
  async getProjectsByUser(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.updatedAt));
  }

  async getProject(id: number, userId: string): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, userId: string, data: Partial<InsertProject>): Promise<Project | undefined> {
    const [updated] = await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .returning();
    return updated;
  }

  async deleteProject(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async getSnapshotsByProject(projectId: number, userId: string): Promise<Snapshot[]> {
    return await db
      .select()
      .from(snapshots)
      .where(and(eq(snapshots.projectId, projectId), eq(snapshots.userId, userId)))
      .orderBy(desc(snapshots.createdAt));
  }

  async createSnapshot(snapshot: InsertSnapshot): Promise<Snapshot> {
    const [newSnapshot] = await db.insert(snapshots).values(snapshot).returning();
    return newSnapshot;
  }

  async deleteSnapshot(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(snapshots)
      .where(and(eq(snapshots.id, id), eq(snapshots.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async deleteUserAndAllData(userId: string): Promise<boolean> {
    await db.delete(snapshots).where(eq(snapshots.userId, userId));
    await db.delete(projects).where(eq(projects.userId, userId));
    const result = await db.delete(users).where(eq(users.id, userId)).returning();
    return result.length > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUserProjectCount(userId: string): Promise<number> {
    const [result] = await db.select({ count: count() }).from(projects).where(eq(projects.userId, userId));
    return result?.count ?? 0;
  }

  async getUserSnapshotCount(userId: string): Promise<number> {
    const [result] = await db.select({ count: count() }).from(snapshots).where(eq(snapshots.userId, userId));
    return result?.count ?? 0;
  }

  async setUserSuspended(userId: string, suspended: boolean): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ suspended, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async deleteUserCascade(userId: string): Promise<boolean> {
    return await this.deleteUserAndAllData(userId);
  }

  async createInvitedUser(email: string): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({ email, firstName: null, lastName: null })
      .returning();
    return user;
  }

  async getAdminByEmail(email: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return admin;
  }

  async createAdmin(email: string, passwordHash: string): Promise<AdminUser> {
    const [admin] = await db
      .insert(adminUsers)
      .values({ email, passwordHash })
      .onConflictDoUpdate({
        target: adminUsers.email,
        set: { passwordHash },
      })
      .returning();
    return admin;
  }

  async getUsersWithStats(): Promise<Array<User & { projectCount: number; snapshotCount: number }>> {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    const result = [];
    for (const user of allUsers) {
      const projectCount = await this.getUserProjectCount(user.id);
      const snapshotCount = await this.getUserSnapshotCount(user.id);
      result.push({ ...user, projectCount, snapshotCount });
    }
    return result;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, userId));
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [msg] = await db.insert(contactMessages).values(message).returning();
    return msg;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }
}

export const storage = new DatabaseStorage();
