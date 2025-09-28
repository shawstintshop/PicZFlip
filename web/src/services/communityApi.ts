// Community marketplace API functions

// Generic API request function (simplified for community endpoints)
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const API_BASE = '/api';
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Create flip item in community marketplace
export async function createFlipItem(analysisId: string, askingPrice?: number) {
  return apiRequest('/flip', {
    method: 'POST',
    body: JSON.stringify({ analysisId, askingPrice }),
  });
}

// Add item to wanted list
export async function addWantedItem(wantedItemData: {
  title: string;
  description?: string;
  category?: string;
  brand?: string;
  model?: string;
  keywords?: string[];
  maxPrice?: number;
  searchRadius?: number;
}) {
  return apiRequest('/wanted', {
    method: 'POST',
    body: JSON.stringify(wantedItemData),
  });
}

// Get nearby flip items
export async function getNearbyFlipItems(maxDistance: number = 25) {
  return apiRequest(`/community/nearby?distance=${maxDistance}`);
}

// Generate platform-specific listings
export async function generatePlatformListings(analysisId: string) {
  return apiRequest('/listings/generate', {
    method: 'POST',
    body: JSON.stringify({ analysisId }),
  });
}

// Get user notifications
export async function getNotifications(limit: number = 20) {
  return apiRequest(`/notifications?limit=${limit}`);
}

// Mark notification as read
export async function markNotificationRead(notificationId: string) {
  return apiRequest(`/notifications/${notificationId}/read`, {
    method: 'PUT',
  });
}

// Get user's flip items
export async function getUserFlipItems() {
  return apiRequest('/user/flips');
}

// Get user's wanted items
export async function getUserWantedItems() {
  return apiRequest('/user/wanted');
}

// Update user platform preferences
export async function updatePlatformPreferences(platforms: any[]) {
  return apiRequest('/user/platforms', {
    method: 'PUT',
    body: JSON.stringify({ platforms }),
  });
}

// Update user location
export async function updateUserLocation(location: {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  searchRadius: number;
}) {
  return apiRequest('/user/location', {
    method: 'PUT',
    body: JSON.stringify({ location }),
  });
}

// Contact seller about item
export async function contactSeller(flipItemId: string, message: string) {
  return apiRequest('/contact/seller', {
    method: 'POST',
    body: JSON.stringify({ flipItemId, message }),
  });
}

// Report user/item
export async function reportItem(itemId: string, reason: string, details?: string) {
  return apiRequest('/report', {
    method: 'POST',
    body: JSON.stringify({ itemId, reason, details }),
  });
}

// Get community stats
export async function getCommunityStats() {
  return apiRequest('/community/stats');
}

// Search community items
export async function searchCommunityItems(query: {
  searchTerm?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  maxDistance?: number;
  condition?: string;
}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value.toString());
    }
  });
  
  return apiRequest(`/community/search?${params.toString()}`);
}