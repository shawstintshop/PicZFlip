export interface UserLocation {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  searchRadius: number; // in miles
}

export interface PlatformPreferences {
  platform: 'facebook' | 'ebay' | 'craigslist' | 'offerup' | 'mercari' | 'poshmark' | 'amazon' | 'etsy';
  isActive: boolean;
  username?: string;
  defaultShippingPolicy?: string;
  preferredCategories: string[];
  priceMultiplier: number; // e.g., 1.2 for 20% markup
}

export interface UserVerification {
  level: 'unverified' | 'email' | 'phone' | 'identity' | 'trusted';
  emailVerified: boolean;
  phoneVerified: boolean;
  identityDocuments: {
    driverLicense?: boolean;
    socialMedia?: string[];
  };
  communityRating: number; // 0-5 stars
  totalTransactions: number;
  joinDate: Date;
  lastActive: Date;
}

export interface UserPreferences {
  uid: string;
  location: UserLocation;
  platforms: PlatformPreferences[];
  verification: UserVerification;
  notifications: {
    wantedItemMatches: boolean;
    localFinds: boolean;
    priceAlerts: boolean;
    communityMessages: boolean;
    emailFrequency: 'immediate' | 'daily' | 'weekly' | 'disabled';
    pushEnabled: boolean;
  };
  privacy: {
    showLocation: boolean;
    allowContactFromMembers: boolean;
    publicProfile: boolean;
  };
  flippingStats: {
    totalAnalyses: number;
    totalFlips: number;
    averageProfit: number;
    successRate: number;
    specialties: string[]; // categories they're good at finding
  };
}

export interface WantedItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  brand: string | undefined;
  model: string | undefined;
  keywords: string[];
  maxPrice: number;
  location: UserLocation;
  searchRadius: number;
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date;
  matches: WantedItemMatch[];
}

export interface WantedItemMatch {
  itemId: string;
  matchScore: number; // 0-100 similarity score
  distance: number; // miles from user
  sellerUserId: string;
  createdAt: Date;
  status: 'new' | 'contacted' | 'interested' | 'deal_made' | 'expired';
}

export interface FlipItem {
  id: string;
  userId: string;
  analysisId: string;
  productName: string;
  brand: string;
  category: string;
  condition: string;
  estimatedValue: {
    low: number;
    high: number;
    currency: string;
  };
  askingPrice: number | undefined;
  location: UserLocation;
  images: string[];
  status: 'analyzing' | 'available' | 'sold' | 'withdrawn';
  interestedUsers: string[];
  generatedListings: {
    [platform: string]: {
      title: string;
      description: string;
      price: number;
      generatedAt: Date;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}