import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";

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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Create Razorpay Order
  app.post("/api/create-razorpay-order", async (req, res) => {
    try {
      const { tier } = req.body; // 'pro' or 'agency'
      const razorpay = getRazorpay();
      
      // Amount in paise (INR)
      let amount = tier === 'pro' ? 49900 : 149900;
      
      const options = {
        amount,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);
      res.json({ order, tier });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Failed to create order" });
    }
  });

  // Verify Razorpay Payment
  app.post("/api/verify-razorpay-payment", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tier } = req.body;
      
      const key_secret = process.env.RAZORPAY_KEY_SECRET || "SVm55HpaHYxhKnwBeCehniy5";
      
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", key_secret)
        .update(body.toString())
        .digest("hex");
        
      if (expectedSignature === razorpay_signature) {
        // Payment is verified
        res.json({ success: true, tier });
      } else {
        res.status(400).json({ success: false, error: "Invalid signature" });
      }
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Failed to verify payment" });
    }
  });

  // Check Subscription Status (Mocked since we don't have a DB or real subscriptions here)
  app.post("/api/subscription-status", async (req, res) => {
    // If the client has a stored tier, we trust it for now as there's no DB
    res.json({ tier: req.body.currentTier || 'free' });
  });

  // API Route for Social Media Post Generation
  app.post("/api/generate-posts", async (req, res) => {
    try {
      const { businessName, industry, platform, tone, goal } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(401).json({ error: "API Key is required" });
      }

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
        config: {
          temperature: 0.7,
        }
      });

      let responseText = response.text || "[]";
      // Clean up markdown if any
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      try {
        const posts = JSON.parse(responseText);
        res.json({ posts });
      } catch (e) {
        console.error("Failed to parse JSON", responseText);
        res.status(500).json({ error: "Failed to parse AI response into JSON." });
      }
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Failed to generate posts" });
    }
  });

  // API Route for Google Review Auto-Responder
  app.post("/api/generate-review-response", async (req, res) => {
    try {
      const { businessName, vibe, reviewText, starRating } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(401).json({ error: "API Key is required" });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are a professional customer service representative for a business.
      
Business Name: ${businessName}
Desired Vibe/Tone: ${vibe}
Customer Review Text: "${reviewText}"
Star Rating: ${starRating} / 5

Generate 3 distinct reply options for this review. 
Option A: Direct & Professional
Option B: Friendly & Warm
Option C: Promotional/Invitation to return (or sincere apology and offer to make it right if low rating)

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
        config: {
          temperature: 0.7,
        }
      });

      let responseText = response.text || "{}";
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      try {
        const replies = JSON.parse(responseText);
        res.json(replies);
      } catch (e) {
        console.error("Failed to parse JSON", responseText);
        res.status(500).json({ error: "Failed to parse AI response into JSON." });
      }
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Failed to generate responses" });
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
    // Support React Router
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
