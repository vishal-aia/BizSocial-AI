import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "./src/db/index.js";
import { users } from "./src/db/schema.js";
import { eq } from "drizzle-orm";

dotenv.config();

let razorpayClient: any = null;
function getRazorpay() {
  if (!razorpayClient) {
    const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_TG5ObFivD35Trb";
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "SVm55HpaHYxhKnwBeCehniy5";
    razorpayClient = new Razorpay({ key_id, key_secret });
  }
  return razorpayClient;
}

const JWT_SECRET = process.env.JWT_SECRET || "this-is-a-super-secret-key-for-jwt";

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Access denied" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AUTH ROUTES
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password } = req.body;
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingUser.length > 0) {
        return res.status(400).json({ error: "Email already exists" });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const [newUser] = await db.insert(users).values({ email, passwordHash }).returning();
      const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET);
      res.json({ token, user: { id: newUser.id, email: newUser.email, tier: newUser.tier, credits: newUser.credits } });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Signup failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (user.length === 0) return res.status(400).json({ error: "Invalid credentials" });
      
      const validPassword = await bcrypt.compare(password, user[0].passwordHash);
      if (!validPassword) return res.status(400).json({ error: "Invalid credentials" });
      
      const token = jwt.sign({ userId: user[0].id, email: user[0].email }, JWT_SECRET);
      res.json({ token, user: { id: user[0].id, email: user[0].email, tier: user[0].tier, credits: user[0].credits } });
    } catch (error: any) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res: any) => {
    try {
      const user = await db.select().from(users).where(eq(users.id, req.user.userId)).limit(1);
      if (user.length === 0) return res.status(404).json({ error: "User not found" });
      res.json({ user: { id: user[0].id, email: user[0].email, tier: user[0].tier, credits: user[0].credits } });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Create Razorpay Order
  app.post("/api/create-razorpay-order", authenticateToken, async (req: any, res: any) => {
    try {
      const { tier } = req.body;
      const razorpay = getRazorpay();
      const amount = tier === 'pro' ? 49900 : 149900;
      
      const options = {
        amount,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      };
      const order = await razorpay.orders.create(options);
      res.json({ order, tier });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Verify Razorpay Payment
  app.post("/api/verify-razorpay-payment", authenticateToken, async (req: any, res: any) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tier } = req.body;
      const key_secret = process.env.RAZORPAY_KEY_SECRET || "SVm55HpaHYxhKnwBeCehniy5";
      
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto.createHmac("sha256", key_secret).update(body.toString()).digest("hex");
        
      if (expectedSignature === razorpay_signature) {
        await db.update(users).set({ tier }).where(eq(users.id, req.user.userId));
        res.json({ success: true, tier });
      } else {
        res.status(400).json({ success: false, error: "Invalid signature" });
      }
    } catch (error: any) {
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  // Check Subscription Status
  app.post("/api/subscription-status", authenticateToken, async (req: any, res: any) => {
    const user = await db.select().from(users).where(eq(users.id, req.user.userId)).limit(1);
    if (user.length > 0) {
      res.json({ tier: user[0].tier, credits: user[0].credits });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  const handleCredits = async (userId: number, res: any) => {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user.length === 0) {
      res.status(404).json({ error: "User not found" });
      return false;
    }
    
    if (user[0].tier === 'free') {
      if (user[0].credits <= 0) {
        res.status(403).json({ error: "Out of credits. Please upgrade your plan.", needsUpgrade: true });
        return false;
      }
      await db.update(users).set({ credits: user[0].credits - 1 }).where(eq(users.id, userId));
    }
    return true;
  };

  // API Route for Social Media Post Generation
  app.post("/api/generate-posts", authenticateToken, async (req: any, res: any) => {
    try {
      if (!(await handleCredits(req.user.userId, res))) return;

      const { businessName, industry, platform, tone, goal } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(401).json({ error: "API Key is required" });

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an expert social media manager. Generate a 1-week batch of social media posts (7 posts) for a business.
      Business Name: ${businessName}
      Industry: ${industry}
      Target Platform: ${platform}
      Tone of Voice: ${tone}
      Goal/Topic: ${goal}
      Return the response STRICTLY as a JSON array where each item has the following structure:
      {
        "day": "Day 1",
        "caption": "The main post caption here",
        "hashtags": "#example #hashtags",
        "imagePrompt": "A detailed image generation prompt for Midjourney",
        "bestTime": "e.g., 9:00 AM"
      }
      Do not include markdown blocks like \`\`\`json, just output the raw JSON array.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { temperature: 0.7 }
      });

      let responseText = response.text || "[]";
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const posts = JSON.parse(responseText);
      res.json({ posts });
    } catch (error: any) {
      console.error(error);
      if (!res.headersSent) res.status(500).json({ error: "Failed to generate posts" });
    }
  });

  // API Route for Google Review Auto-Responder
  app.post("/api/generate-review-response", authenticateToken, async (req: any, res: any) => {
    try {
      if (!(await handleCredits(req.user.userId, res))) return;

      const { businessName, vibe, reviewText, starRating } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(401).json({ error: "API Key is required" });

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a professional customer service representative for a business.
      Business Name: ${businessName}
      Desired Vibe/Tone: ${vibe}
      Customer Review Text: "${reviewText}"
      Star Rating: ${starRating} / 5
      Generate 3 distinct reply options for this review. 
      Return the response STRICTLY as a JSON object with this structure:
      {
        "optionA": "Text for Option A",
        "optionB": "Text for Option B",
        "optionC": "Text for Option C"
      }
      Do not include markdown blocks like \`\`\`json, just output the raw JSON object.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { temperature: 0.7 }
      });

      let responseText = response.text || "{}";
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const replies = JSON.parse(responseText);
      res.json(replies);
    } catch (error: any) {
      console.error(error);
      if (!res.headersSent) res.status(500).json({ error: "Failed to generate responses" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { port: 24678 }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on('error', (e: any) => {
    if (e.code === 'EADDRINUSE') {
      console.error('Address in use, retrying in a second...');
      setTimeout(() => {
        server.close();
        server.listen(PORT, "0.0.0.0");
      }, 1000);
    }
  });
}

startServer();
