import { onRequest, onCall, HttpsError } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import { ENV } from "./env.js";
import { mainOrchestrator } from "./agents/core/orchestrator.js";
import { db } from "./lib/firestore.js";
import * as admin from "firebase-admin";
import { log, err } from "./lib/logger.js";
import { getVisionService } from "./lib/vision.js";
import { getGeminiService } from "./lib/gemini.js";

// Set global options for all functions
setGlobalOptions({
  region: ENV.REGION,
  maxInstances: 10,
  timeoutSeconds: 540,
  memory: "1GiB"
});

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

function corsHeaders(res: any) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}

export const api = onRequest(async (req: any, res: any) => {
  corsHeaders(res);
  if (req.method === "OPTIONS") return res.status(204).send("");
  
  try {
    const path = req.path.replace(/^\/api/, "") || "/";
    
    // Start photo analysis
    if (req.method === "POST" && path === "/analyze") {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Unauthorized" });
      
      const decodedToken = await admin.auth().verifyIdToken(token);
      const uid = decodedToken.uid;
      
      const imageBuffer = Buffer.from(req.body.image, 'base64');
      
      // Create analysis document
      const analysisRef = db.collection('analyses').doc();
      const analysisId = analysisRef.id;
      
      // Start async processing
      mainOrchestrator.processPhotoAnalysis(imageBuffer, uid, analysisId)
        .catch(error => {
          err(`Analysis ${analysisId} failed:`, error);
        });
      
      // Return immediately with analysis ID
      return res.json({ 
        analysisId,
        status: 'started',
        message: 'Analysis started. Use the analysis ID to check progress.'
      });
    }
    
    // Get analysis status/results
    if (req.method === "GET" && path.startsWith("/analysis/")) {
      const analysisId = path.replace("/analysis/", "");
      const doc = await db.collection('analyses').doc(analysisId).get();
      
      if (!doc.exists) {
        return res.status(404).json({ error: "Analysis not found" });
      }
      
      return res.json({ id: doc.id, ...doc.data() });
    }
    
    // Get user's analysis history
    if (req.method === "GET" && path === "/analyses") {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Unauthorized" });
      
      const decodedToken = await admin.auth().verifyIdToken(token);
      const uid = decodedToken.uid;
      
      const snapshot = await db.collection('analyses')
        .where('uid', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();
      
      const analyses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.json(analyses);
    }
    
    // Get available sources
    if (req.method === "GET" && path === "/sources") {
      const { getAllActiveSources } = await import("./lib/sourceRegistry.js");
      const sources = getAllActiveSources();
      
      return res.json({
        totalSources: sources.length,
        sources: sources.map(s => ({
          id: s.id,
          name: s.name,
          categories: s.categories,
          priority: s.priority,
          region: s.region
        }))
      });
    }

    // Get sources by category
    if (req.method === "GET" && path === "/sources/category") {
      const { category } = req.query;
      if (!category) {
        return res.status(400).json({ error: "Category parameter required" });
      }

      const { getSourcesByCategory } = await import("./lib/sourceRegistry.js");
      const sources = getSourcesByCategory([category as string]);
      
      return res.json({
        category,
        sources: sources.map(s => ({
          id: s.id,
          name: s.name,
          categories: s.categories,
          priority: s.priority,
          region: s.region
        }))
      });
    }

    // Search specific source directly
    if (req.method === "POST" && path === "/search/source") {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Unauthorized" });
      
      const { sourceId, query, itemData: _itemData } = req.body;
      
      if (!sourceId || !query) {
        return res.status(400).json({ error: "Source ID and query required" });
      }

      try {
        // TODO: Implement adapter manager
        // const { AdapterManager } = await import("./lib/adapterManager.js");
        const { getSourceById } = await import("./lib/sourceRegistry.js");
        
        const source = getSourceById(sourceId);
        if (!source) {
          return res.status(404).json({ error: "Source not found" });
        }

        // TODO: Implement AdapterManager
        // const adapterManager = new AdapterManager();
        // const adapter = await adapterManager.getAdapter(source.adapter);
        // const results = await adapter.search(query, itemData || {}, source);
        
        return res.json({
          results: [],
          message: "Search functionality not yet implemented",
          sourceId,
          sourceName: source.name,
          query,
          resultCount: 0
        });
      } catch (error: any) {
        err(`Direct search failed for ${sourceId}:`, error);
        return res.status(500).json({ 
          error: "Search failed", 
          details: error.message 
        });
      }
    }

    // Get user profile
    if (req.method === "GET" && path === "/profile") {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Unauthorized" });
      
      const decodedToken = await admin.auth().verifyIdToken(token);
      const uid = decodedToken.uid;
      
      const doc = await db.collection('users').doc(uid).get();
      
      if (!doc.exists) {
        // Create profile if it doesn't exist
        const profile = {
          uid,
          email: decodedToken.email,
          displayName: decodedToken.name || decodedToken.email,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          lastLogin: admin.firestore.FieldValue.serverTimestamp(),
          preferences: {
            defaultRegion: 'US',
            favoriteCategories: [],
            notificationSettings: {
              email: true,
              push: true
            }
          }
        };
        
        await db.collection('users').doc(uid).set(profile);
        return res.json(profile);
      }
      
      // Update last login
      await db.collection('users').doc(uid).update({
        lastLogin: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return res.json({ id: doc.id, ...doc.data() });
    }

    // Update user profile
    if (req.method === "PUT" && path === "/profile") {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Unauthorized" });
      
      const decodedToken = await admin.auth().verifyIdToken(token);
      const uid = decodedToken.uid;
      
      const updates = req.body;
      delete updates.uid; // Prevent changing user ID
      delete updates.email; // Prevent changing email
      
      await db.collection('users').doc(uid).update({
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return res.json({ message: "Profile updated successfully" });
    }

    // Health check
    if (req.method === "GET" && path === "/health") {
      const { getHealthMonitor } = await import("./lib/health.js");
      const healthMonitor = getHealthMonitor();
      
      // Check if this is a quick health check (for load balancers)
      if (req.query.quick === 'true') {
        const quickStatus = await healthMonitor.quickCheck();
        return res.status(quickStatus.status === 'ok' ? 200 : 503).json(quickStatus);
      }
      
      // Full health check
      const healthStatus = await healthMonitor.checkHealth();
      const statusCode = healthStatus.overall === 'healthy' ? 200 : 
                        healthStatus.overall === 'degraded' ? 200 : 503;
      
      return res.status(statusCode).json(healthStatus);
    }

    // Enhanced photo analysis with Vision + Gemini
    if (req.method === "POST" && path === "/analyze/enhanced") {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Unauthorized" });
      
      const decodedToken = await admin.auth().verifyIdToken(token);
      const uid = decodedToken.uid;
      
      const { image, userContext } = req.body;
      if (!image) return res.status(400).json({ error: "Image data required" });
      
      const imageBuffer = Buffer.from(image, 'base64');
      
      // Create analysis document
      const analysisRef = db.collection('analyses').doc();
      const analysisId = analysisRef.id;
      
      // Start enhanced analysis (Vision + Gemini)
      enhancedPhotoAnalysis(imageBuffer, uid, analysisId, userContext)
        .catch(error => {
          err(`Enhanced analysis ${analysisId} failed:`, error);
        });
      
      return res.json({ 
        analysisId,
        status: 'started',
        message: 'Enhanced analysis started with Vision + Gemini AI',
        type: 'enhanced'
      });
    }
    
    return res.status(404).json({ error: "Not found" });
    
  } catch (error: any) {
    err("API Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Export individual functions for better performance
export const analyzePhoto = onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { image } = data;
  if (!image) {
    throw new HttpsError('invalid-argument', 'Image data is required');
  }

  try {
    const imageBuffer = Buffer.from(image, 'base64');
    const analysisRef = db.collection('analyses').doc();
    const analysisId = analysisRef.id;

    // Start async processing
    mainOrchestrator.processPhotoAnalysis(imageBuffer, context.auth.uid, analysisId)
      .catch(error => {
        err(`Analysis ${analysisId} failed:`, error);
      });

    return { analysisId, status: 'started' };
  } catch (error: any) {
    err('Photo analysis failed:', error);
    throw new HttpsError('internal', error.message);
  }
});

export const getAnalysis = onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { analysisId } = data;
  if (!analysisId) {
    throw new HttpsError('invalid-argument', 'Analysis ID is required');
  }

  try {
    const doc = await db.collection('analyses').doc(analysisId).get();
    
    if (!doc.exists) {
      throw new HttpsError('not-found', 'Analysis not found');
    }

    const analysis = doc.data();
    
    // Ensure user can only access their own analyses
    if (analysis && analysis.uid !== context.auth.uid) {
      throw new HttpsError('permission-denied', 'Access denied');
    }

    return { id: doc.id, ...analysis };
  } catch (error: any) {
    err('Get analysis failed:', error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Enhanced photo analysis using Google Cloud Vision + Gemini AI
 */
async function enhancedPhotoAnalysis(
  imageBuffer: Buffer, 
  uid: string, 
  analysisId: string, 
  userContext?: any
): Promise<void> {
  const startTime = Date.now();
  
  try {
    log('Starting enhanced photo analysis', { 
      analysisId, 
      uid, 
      imageSize: imageBuffer.length 
    });

    // Initialize analysis document
    await db.collection('analyses').doc(analysisId).set({
      uid,
      status: 'processing',
      type: 'enhanced',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      progress: {
        stage: 'vision_analysis',
        percentage: 10
      }
    });

    // Step 1: Google Cloud Vision Analysis
    const visionService = getVisionService();
    const visionResult = await visionService.analyzeImage(imageBuffer);
    
    await db.collection('analyses').doc(analysisId).update({
      visionResult,
      progress: {
        stage: 'ai_analysis',
        percentage: 50
      }
    });

    log('Vision analysis completed', { 
      analysisId, 
      labelsFound: visionResult.labels.length,
      objectsFound: visionResult.objects.length 
    });

    // Step 2: Gemini AI Analysis
    const geminiService = getGeminiService();
    const geminiResult = await geminiService.analyzeProduct(imageBuffer, visionResult, userContext);

    await db.collection('analyses').doc(analysisId).update({
      geminiResult,
      progress: {
        stage: 'finalizing',
        percentage: 90
      }
    });

    log('Gemini analysis completed', { 
      analysisId, 
      productName: geminiResult.productIdentification.productName,
      confidence: geminiResult.productIdentification.confidence 
    });

    // Step 3: Generate marketplace listings
    const listingPlatforms = ['ebay', 'amazon', 'facebook'] as const;
    const listings: Record<string, any> = {};
    
    for (const platform of listingPlatforms) {
      try {
        const listing = await geminiService.generateListingContent(geminiResult, platform);
        listings[platform] = listing;
      } catch (error: any) {
        err(`Failed to generate ${platform} listing`, { analysisId, error: error.message });
        listings[platform] = { error: error.message };
      }
    }

    // Final update with complete results
    const totalTime = Date.now() - startTime;
    await db.collection('analyses').doc(analysisId).update({
      status: 'completed',
      listings,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      processingTime: totalTime,
      progress: {
        stage: 'completed',
        percentage: 100
      },
      summary: {
        productName: geminiResult.productIdentification.productName,
        brand: geminiResult.productIdentification.brand,
        category: geminiResult.productIdentification.category,
        estimatedValue: geminiResult.pricingInsights.estimatedValueRange,
        confidence: geminiResult.metadata.confidenceScore
      }
    });

    log('Enhanced analysis completed successfully', { 
      analysisId, 
      uid, 
      totalTime,
      productName: geminiResult.productIdentification.productName
    });

  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    err('Enhanced analysis failed', { 
      analysisId, 
      uid, 
      error: error.message, 
      stack: error.stack,
      totalTime 
    });

    // Update document with error status
    await db.collection('analyses').doc(analysisId).update({
      status: 'failed',
      error: {
        message: error.message,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      },
      failedAt: admin.firestore.FieldValue.serverTimestamp(),
      processingTime: totalTime
    });

    throw error;
  }
}

// Export the enhanced analysis function
export const analyzePhotoEnhanced = onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

    const { image, userContext } = data;
    if (!image) {
      throw new HttpsError('invalid-argument', 'Image data is required');
    }

    try {
      const imageBuffer = Buffer.from(image, 'base64');
      const analysisRef = db.collection('analyses').doc();
      const analysisId = analysisRef.id;

      // Start async processing
      enhancedPhotoAnalysis(imageBuffer, context.auth.uid, analysisId, userContext)
        .catch(error => {
          err(`Enhanced analysis ${analysisId} failed:`, error);
        });

      return { 
        analysisId, 
        status: 'started',
        type: 'enhanced'
      };
    } catch (error: any) {
      err('Enhanced photo analysis failed:', error);
      throw new HttpsError('internal', error.message);
    }
  });
