import { db } from '../lib/firestore.js';
import { log, err } from '../lib/logger.js';
import { getGeminiService } from '../lib/gemini.js';
import { UserPreferences, WantedItem, FlipItem, WantedItemMatch } from '../models/userPreferences.js';
import * as admin from 'firebase-admin';

export class CommunityService {
  
  /**
   * Generate platform-specific listings for user's active platforms
   */
  async generatePlatformListings(
    analysisId: string, 
    userId: string, 
    flipType: 'flip' | 'sell' = 'flip'
  ): Promise<{ [platform: string]: any }> {
    try {
      log('Generating platform listings', { analysisId, userId, flipType });

      // Get user preferences
      const userDoc = await db.collection('userPreferences').doc(userId).get();
      const userPrefs = userDoc.data() as UserPreferences;
      
      if (!userPrefs || !userPrefs.platforms) {
        throw new Error('User preferences not found or no platforms configured');
      }

      // Get analysis data
      const analysisDoc = await db.collection('analyses').doc(analysisId).get();
      const analysis = analysisDoc.data();
      
      if (!analysis) {
        throw new Error('Analysis not found');
      }

      const geminiService = getGeminiService();
      const listings: { [platform: string]: any } = {};

      // Generate listings for each active platform
      const activePlatforms = userPrefs.platforms.filter(p => p.isActive);
      
      for (const platformPrefs of activePlatforms) {
        try {
          log(`Generating listing for ${platformPrefs.platform}`, { userId, analysisId });

          const customizations = {
            condition: 'used',
            priceRange: {
              min: Math.round(analysis.geminiResult?.pricingInsights?.estimatedValueRange?.low * platformPrefs.priceMultiplier) || 10,
              max: Math.round(analysis.geminiResult?.pricingInsights?.estimatedValueRange?.high * platformPrefs.priceMultiplier) || 50
            }
          };

          const listing = await geminiService.generateListingContent(
            analysis.geminiResult,
            platformPrefs.platform as any,
            customizations
          );

          listings[platformPrefs.platform] = {
            ...listing,
            platform: platformPrefs.platform,
            username: platformPrefs.username,
            generatedAt: new Date(),
            customizations
          };

        } catch (error: any) {
          err(`Failed to generate listing for ${platformPrefs.platform}`, { 
            error: error.message, 
            userId, 
            analysisId 
          });
          
          listings[platformPrefs.platform] = {
            error: error.message,
            platform: platformPrefs.platform
          };
        }
      }

      return listings;

    } catch (error: any) {
      err('Failed to generate platform listings', { error: error.message, userId, analysisId });
      throw error;
    }
  }

  /**
   * Create a flip item in the community marketplace
   */
  async createFlipItem(analysisId: string, userId: string, askingPrice?: number): Promise<string> {
    try {
      log('Creating flip item', { analysisId, userId, askingPrice });

      const [userDoc, analysisDoc] = await Promise.all([
        db.collection('userPreferences').doc(userId).get(),
        db.collection('analyses').doc(analysisId).get()
      ]);

      const userPrefs = userDoc.data() as UserPreferences;
      const analysis = analysisDoc.data();

      if (!userPrefs) {
        throw new Error('User preferences required to create flip item');
      }

      if (!analysis) {
        throw new Error('Analysis not found');
      }

      // Generate platform listings
      const generatedListings = await this.generatePlatformListings(analysisId, userId, 'flip');

      const flipItem: FlipItem = {
        id: '', // Will be set by Firestore
        userId,
        analysisId,
        productName: analysis.geminiResult?.productIdentification?.productName || 'Unknown Item',
        brand: analysis.geminiResult?.productIdentification?.brand || '',
        category: analysis.geminiResult?.productIdentification?.category || 'General',
        condition: analysis.geminiResult?.marketingInfo?.condition || 'used',
        estimatedValue: analysis.geminiResult?.pricingInsights?.estimatedValueRange || {
          low: 10,
          high: 50,
          currency: 'USD'
        },
        askingPrice,
        location: userPrefs.location,
        images: [], // TODO: Extract from analysis if available
        status: 'available',
        interestedUsers: [],
        generatedListings,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const flipRef = await db.collection('flipItems').add(flipItem);
      flipItem.id = flipRef.id;

      // Update user stats
      await this.updateUserStats(userId, 'flip_created');

      // Check for wanted item matches
      await this.checkWantedItemMatches(flipItem);

      log('Flip item created successfully', { flipId: flipRef.id, userId });
      return flipRef.id;

    } catch (error: any) {
      err('Failed to create flip item', { error: error.message, userId, analysisId });
      throw error;
    }
  }

  /**
   * Add item to wanted list
   */
  async addWantedItem(userId: string, wantedItemData: Partial<WantedItem>): Promise<string> {
    try {
      log('Adding wanted item', { userId, title: wantedItemData.title });

      const userDoc = await db.collection('userPreferences').doc(userId).get();
      const userPrefs = userDoc.data() as UserPreferences;

      if (!userPrefs) {
        throw new Error('User preferences required');
      }

      const wantedItem: WantedItem = {
        id: '',
        userId,
        title: wantedItemData.title || '',
        description: wantedItemData.description || '',
        category: wantedItemData.category || 'General',
        brand: wantedItemData.brand,
        model: wantedItemData.model,
        keywords: wantedItemData.keywords || [],
        maxPrice: wantedItemData.maxPrice || 1000,
        location: userPrefs.location,
        searchRadius: wantedItemData.searchRadius || userPrefs.location.searchRadius,
        isActive: true,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        matches: []
      };

      const wantedRef = await db.collection('wantedItems').add(wantedItem);
      wantedItem.id = wantedRef.id;

      // Check for existing matches
      await this.findExistingMatches(wantedItem);

      log('Wanted item added successfully', { wantedId: wantedRef.id, userId });
      return wantedRef.id;

    } catch (error: any) {
      err('Failed to add wanted item', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Check for wanted item matches when new flip item is created
   */
  private async checkWantedItemMatches(flipItem: FlipItem): Promise<void> {
    try {
      log('Checking wanted item matches', { flipId: flipItem.id });

      // Find wanted items in the area
      const wantedQuery = await db.collection('wantedItems')
        .where('isActive', '==', true)
        .where('category', '==', flipItem.category)
        .get();

      const matches: WantedItemMatch[] = [];

      for (const wantedDoc of wantedQuery.docs) {
        const wanted = wantedDoc.data() as WantedItem;
        
        // Skip own wanted items
        if (wanted.userId === flipItem.userId) continue;

        // Calculate distance
        const distance = this.calculateDistance(
          flipItem.location.latitude,
          flipItem.location.longitude,
          wanted.location.latitude,
          wanted.location.longitude
        );

        // Check if within search radius
        if (distance > wanted.searchRadius) continue;

        // Calculate match score
        const matchScore = this.calculateMatchScore(flipItem, wanted);

        if (matchScore > 60) { // Minimum 60% match
          const match: WantedItemMatch = {
            itemId: flipItem.id,
            matchScore,
            distance,
            sellerUserId: flipItem.userId,
            createdAt: new Date(),
            status: 'new'
          };

          matches.push(match);

          // Add to wanted item's matches
          await db.collection('wantedItems').doc(wanted.id).update({
            matches: admin.firestore.FieldValue.arrayUnion(match)
          });

          // Send notification to wanted item owner
          await this.sendMatchNotification(wanted.userId, flipItem, match);
        }
      }

      log('Wanted item matching completed', { 
        flipId: flipItem.id, 
        matchesFound: matches.length 
      });

    } catch (error: any) {
      err('Failed to check wanted item matches', { 
        error: error.message, 
        flipId: flipItem.id 
      });
    }
  }

  /**
   * Find existing matches for new wanted item
   */
  private async findExistingMatches(wantedItem: WantedItem): Promise<void> {
    try {
      log('Finding existing matches for wanted item', { wantedId: wantedItem.id });

      const flipQuery = await db.collection('flipItems')
        .where('status', '==', 'available')
        .where('category', '==', wantedItem.category)
        .get();

      const matches: WantedItemMatch[] = [];

      for (const flipDoc of flipQuery.docs) {
        const flip = flipDoc.data() as FlipItem;
        
        // Skip own items
        if (flip.userId === wantedItem.userId) continue;

        // Calculate distance
        const distance = this.calculateDistance(
          wantedItem.location.latitude,
          wantedItem.location.longitude,
          flip.location.latitude,
          flip.location.longitude
        );

        // Check if within search radius
        if (distance > wantedItem.searchRadius) continue;

        // Calculate match score
        const matchScore = this.calculateMatchScore(flip, wantedItem);

        if (matchScore > 60) { // Minimum 60% match
          const match: WantedItemMatch = {
            itemId: flip.id,
            matchScore,
            distance,
            sellerUserId: flip.userId,
            createdAt: new Date(),
            status: 'new'
          };

          matches.push(match);
        }
      }

      if (matches.length > 0) {
        await db.collection('wantedItems').doc(wantedItem.id).update({
          matches: matches
        });

        log('Found existing matches', { 
          wantedId: wantedItem.id, 
          matchesFound: matches.length 
        });
      }

    } catch (error: any) {
      err('Failed to find existing matches', { 
        error: error.message, 
        wantedId: wantedItem.id 
      });
    }
  }

  /**
   * Calculate match score between flip item and wanted item
   */
  private calculateMatchScore(flipItem: FlipItem, wantedItem: WantedItem): number {
    let score = 0;

    // Category match (40 points)
    if (flipItem.category === wantedItem.category) {
      score += 40;
    }

    // Brand match (30 points)
    if (flipItem.brand && wantedItem.brand && 
        flipItem.brand.toLowerCase() === wantedItem.brand.toLowerCase()) {
      score += 30;
    }

    // Title/name similarity (20 points)
    const titleScore = this.calculateTextSimilarity(
      flipItem.productName.toLowerCase(),
      wantedItem.title.toLowerCase()
    );
    score += titleScore * 20;

    // Keywords match (10 points)
    if (wantedItem.keywords.length > 0) {
      const keywordMatches = wantedItem.keywords.filter(keyword =>
        flipItem.productName.toLowerCase().includes(keyword.toLowerCase()) ||
        flipItem.brand.toLowerCase().includes(keyword.toLowerCase())
      ).length;
      score += (keywordMatches / wantedItem.keywords.length) * 10;
    }

    return Math.min(100, Math.round(score));
  }

  /**
   * Calculate text similarity using simple word overlap
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.split(' ').filter(w => w.length > 2));
    const words2 = new Set(text2.split(' ').filter(w => w.length > 2));
    
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Calculate distance between two coordinates in miles
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Send notification about item match
   */
  private async sendMatchNotification(
    userId: string, 
    flipItem: FlipItem, 
    match: WantedItemMatch
  ): Promise<void> {
    try {
      const notification = {
        userId,
        type: 'wanted_item_match',
        title: 'Item Match Found!',
        message: `Found a ${flipItem.productName} by ${flipItem.brand} near you (${match.distance.toFixed(1)} miles away)`,
        data: {
          flipItemId: flipItem.id,
          sellerId: flipItem.userId,
          matchScore: match.matchScore,
          distance: match.distance
        },
        createdAt: new Date(),
        read: false
      };

      await db.collection('notifications').add(notification);
      
      log('Match notification sent', { userId, flipItemId: flipItem.id });

    } catch (error: any) {
      err('Failed to send match notification', { 
        error: error.message, 
        userId, 
        flipItemId: flipItem.id 
      });
    }
  }

  /**
   * Update user statistics
   */
  private async updateUserStats(userId: string, action: string): Promise<void> {
    try {
      const userRef = db.collection('userPreferences').doc(userId);
      
      const updates: any = {
        'flippingStats.lastActive': new Date()
      };

      switch (action) {
        case 'flip_created':
          updates['flippingStats.totalFlips'] = admin.firestore.FieldValue.increment(1);
          break;
        case 'analysis_completed':
          updates['flippingStats.totalAnalyses'] = admin.firestore.FieldValue.increment(1);
          break;
      }

      await userRef.update(updates);

    } catch (error: any) {
      err('Failed to update user stats', { error: error.message, userId, action });
    }
  }

  /**
   * Get nearby flip items for user
   */
  async getNearbyFlipItems(userId: string, maxDistance: number = 25): Promise<FlipItem[]> {
    try {
      const userDoc = await db.collection('userPreferences').doc(userId).get();
      const userPrefs = userDoc.data() as UserPreferences;

      if (!userPrefs?.location) {
        return [];
      }

      const flipQuery = await db.collection('flipItems')
        .where('status', '==', 'available')
        .where('userId', '!=', userId) // Don't show own items
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      const nearbyItems: FlipItem[] = [];

      flipQuery.docs.forEach(doc => {
        const flip = doc.data() as FlipItem;
        flip.id = doc.id;

        const distance = this.calculateDistance(
          userPrefs.location.latitude,
          userPrefs.location.longitude,
          flip.location.latitude,
          flip.location.longitude
        );

        if (distance <= maxDistance) {
          nearbyItems.push(flip);
        }
      });

      return nearbyItems.sort((a, b) => {
        const distA = this.calculateDistance(
          userPrefs.location.latitude,
          userPrefs.location.longitude,
          a.location.latitude,
          a.location.longitude
        );
        const distB = this.calculateDistance(
          userPrefs.location.latitude,
          userPrefs.location.longitude,
          b.location.latitude,
          b.location.longitude
        );
        return distA - distB;
      });

    } catch (error: any) {
      err('Failed to get nearby flip items', { error: error.message, userId });
      return [];
    }
  }
}

export const communityService = new CommunityService();