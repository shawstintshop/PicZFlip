import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as cors from "cors";
import * as express from "express";

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Basic analyze endpoint
app.post("/analyze", (req, res) => {
  res.json({
    message: "Analysis endpoint ready",
    timestamp: new Date().toISOString()
  });
});

export const api = functions.https.onRequest(app);
