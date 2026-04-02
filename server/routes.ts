import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { insertProjectSchema, insertSnapshotSchema, insertContactMessageSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import {
  getDealSummary,
  getPipelineStageBreakdown,
  getContactCount,
  getCompanyCount,
  getDealsByMonth,
  checkHubSpotConnection,
} from "./hubspot";

async function seedAdmin() {
  const existing = await storage.getAdminByEmail("admin@krykk.com");
  const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "KrykkAdmin2026!";
  if (!existing) {
    const hash = await bcrypt.hash(defaultPassword, 12);
    await storage.createAdmin("admin@krykk.com", hash);
  }
}

const isAdminAuthenticated: RequestHandler = (req: any, res, next) => {
  if (req.session?.adminId) {
    return next();
  }
  return res.status(401).json({ message: "Admin authentication required" });
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);
  await seedAdmin();

  app.get("/api/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projects = await storage.getProjectsByUser(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId, userId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertProjectSchema.safeParse({ ...req.body, userId });
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid project data", errors: parsed.error.errors });
      }
      const project = await storage.createProject(parsed.data);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put("/api/projects/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectId = parseInt(req.params.id);
      const { name, data } = req.body;
      const project = await storage.updateProject(projectId, userId, { name, data });
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectId = parseInt(req.params.id);
      const deleted = await storage.deleteProject(projectId, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json({ message: "Project deleted" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  app.get("/api/projects/:projectId/snapshots", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectId = parseInt(req.params.projectId);
      const snapshots = await storage.getSnapshotsByProject(projectId, userId);
      res.json(snapshots);
    } catch (error) {
      console.error("Error fetching snapshots:", error);
      res.status(500).json({ message: "Failed to fetch snapshots" });
    }
  });

  app.post("/api/projects/:projectId/snapshots", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId, userId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      const { name, imageData } = req.body;
      if (!name || !imageData) {
        return res.status(400).json({ message: "Name and image data are required" });
      }
      const snapshot = await storage.createSnapshot({ projectId, userId, name, imageData });
      res.status(201).json(snapshot);
    } catch (error) {
      console.error("Error creating snapshot:", error);
      res.status(500).json({ message: "Failed to create snapshot" });
    }
  });

  app.delete("/api/snapshots/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const snapshotId = parseInt(req.params.id);
      const deleted = await storage.deleteSnapshot(snapshotId, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Snapshot not found" });
      }
      res.json({ message: "Snapshot deleted" });
    } catch (error) {
      console.error("Error deleting snapshot:", error);
      res.status(500).json({ message: "Failed to delete snapshot" });
    }
  });

  app.delete("/api/account", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deleted = await storage.deleteUserAndAllData(userId);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      req.logout(() => {
        res.json({ message: "Account deleted successfully" });
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const parsed = insertContactMessageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Please fill in all fields correctly", errors: parsed.error.errors });
      }
      await storage.createContactMessage(parsed.data);
      res.status(201).json({ message: "Message sent successfully" });
    } catch (error) {
      console.error("Error saving contact message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get("/api/admin/contact-messages", isAdminAuthenticated, async (_req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/admin/login", async (req: any, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      const admin = await storage.getAdminByEmail(email);
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const valid = await bcrypt.compare(password, admin.passwordHash);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session.adminId = admin.id;
      req.session.adminEmail = admin.email;
      res.json({ message: "Login successful", email: admin.email });
    } catch (error) {
      console.error("Error admin login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/admin/logout", (req: any, res) => {
    delete req.session.adminId;
    delete req.session.adminEmail;
    res.json({ message: "Logged out" });
  });

  app.get("/api/admin/check", (req: any, res) => {
    if (req.session?.adminId) {
      res.json({ authenticated: true, email: req.session.adminEmail });
    } else {
      res.status(401).json({ authenticated: false });
    }
  });

  app.get("/api/admin/users", isAdminAuthenticated, async (_req, res) => {
    try {
      const users = await storage.getUsersWithStats();
      res.json(users);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/stats", isAdminAuthenticated, async (_req, res) => {
    try {
      const users = await storage.getUsersWithStats();
      const totalUsers = users.length;
      const activeUsers = users.filter(u => !u.suspended).length;
      const suspendedUsers = users.filter(u => u.suspended).length;
      const totalProjects = users.reduce((sum, u) => sum + u.projectCount, 0);
      const totalSnapshots = users.reduce((sum, u) => sum + u.snapshotCount, 0);
      const recentLogins = users.filter(u => {
        if (!u.lastLoginAt) return false;
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return new Date(u.lastLoginAt) > weekAgo;
      }).length;
      res.json({ totalUsers, activeUsers, suspendedUsers, totalProjects, totalSnapshots, recentLogins });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.post("/api/admin/users/invite", isAdminAuthenticated, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const user = await storage.createInvitedUser(email);
      res.status(201).json(user);
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(409).json({ message: "User with this email already exists" });
      }
      console.error("Error inviting user:", error);
      res.status(500).json({ message: "Failed to invite user" });
    }
  });

  app.patch("/api/admin/users/:userId/suspend", isAdminAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.userId as string;
      const { suspended } = req.body;
      const user = await storage.setUserSuspended(userId, suspended);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error suspending user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:userId", isAdminAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.userId as string;
      const deleted = await storage.deleteUserCascade(userId);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User and all data deleted" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // HubSpot integration routes
  app.get("/api/hubspot/connect", isAuthenticated, (_req, res) => {
    // The HubSpot OAuth flow is managed by the Replit connectors platform.
    // Redirect users to the Replit integrations settings page so they can
    // authorize the HubSpot connector for this Repl.
    const replSlug = process.env.REPL_SLUG;
    const replOwner = process.env.REPL_OWNER;
    if (replSlug && replOwner) {
      return res.redirect(`https://replit.com/@${replOwner}/${replSlug}?tab=integrations`);
    }
    return res.redirect("https://replit.com");
  });

  app.get("/api/hubspot/status", isAuthenticated, async (_req, res) => {
    try {
      const connected = await checkHubSpotConnection();
      res.json({ connected });
    } catch (error) {
      res.json({ connected: false });
    }
  });

  app.get("/api/hubspot/deals/summary", isAuthenticated, async (_req, res) => {
    try {
      const summary = await getDealSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching HubSpot deal summary:", error);
      res.status(500).json({ message: "Failed to fetch deal summary" });
    }
  });

  app.get("/api/hubspot/deals/pipeline", isAuthenticated, async (_req, res) => {
    try {
      const stages = await getPipelineStageBreakdown();
      res.json(stages);
    } catch (error) {
      console.error("Error fetching HubSpot pipeline:", error);
      res.status(500).json({ message: "Failed to fetch pipeline data" });
    }
  });

  app.get("/api/hubspot/contacts/count", isAuthenticated, async (_req, res) => {
    try {
      const count = await getContactCount();
      res.json({ count });
    } catch (error) {
      console.error("Error fetching HubSpot contact count:", error);
      res.status(500).json({ message: "Failed to fetch contact count" });
    }
  });

  app.get("/api/hubspot/companies/count", isAuthenticated, async (_req, res) => {
    try {
      const count = await getCompanyCount();
      res.json({ count });
    } catch (error) {
      console.error("Error fetching HubSpot company count:", error);
      res.status(500).json({ message: "Failed to fetch company count" });
    }
  });

  app.get("/api/hubspot/deals/monthly", isAuthenticated, async (_req, res) => {
    try {
      const data = await getDealsByMonth();
      res.json(data);
    } catch (error) {
      console.error("Error fetching HubSpot monthly deals:", error);
      res.status(500).json({ message: "Failed to fetch monthly deals" });
    }
  });

  return httpServer;
}
