import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';

const API_BASE = '/api';

// Generic API request function
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const token = await user.getIdToken();
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Photo Analysis
export async function analyzePhoto(imageBase64: string) {
  return apiRequest('/analyze', {
    method: 'POST',
    body: JSON.stringify({ image: imageBase64 }),
  });
}

// Get Analysis Results
export async function getAnalysis(analysisId: string) {
  return apiRequest(`/analysis/${analysisId}`);
}

// Get User History
export async function getUserHistory() {
  return apiRequest('/analyses');
}

// Get Available Sources
export async function getSources() {
  return apiRequest('/sources');
}

// Direct Source Search
export async function searchSource(sourceId: string, query: string) {
  return apiRequest(`/sources/${sourceId}/search`, {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
}

// User Profile Management
export async function updateUserProfile(profileData: any) {
  return apiRequest('/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}

// Health Check
export async function healthCheck() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

// Firebase Callable Functions
const functions = getFunctions();

// Photo Analysis Callable Function
export const analyzePhotoCallable = httpsCallable(functions, 'analyzePhoto');

// Get Analysis Callable Function
export const getAnalysisCallable = httpsCallable(functions, 'getAnalysis');
