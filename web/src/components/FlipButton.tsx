import { useState } from 'react';
import { Zap, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { createFlipItem, generatePlatformListings } from '../services/communityApi';
import { PlatformListings } from './PlatformListings';

interface FlipButtonProps {
  analysisId: string;
  productName: string;
  estimatedValue: {
    low: number;
    high: number;
    currency: string;
  };
}

export function FlipButton({ analysisId, productName, estimatedValue }: FlipButtonProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipCreated, setFlipCreated] = useState(false);
  const [showListings, setShowListings] = useState(false);
  const [listings, setListings] = useState<any>(null);
  const [askingPrice, setAskingPrice] = useState(
    Math.round((estimatedValue.low + estimatedValue.high) / 2)
  );
  const [error, setError] = useState<string | null>(null);

  const handleFlipItem = async () => {
    try {
      setIsFlipping(true);
      setError(null);

      // Create flip item in community marketplace
      await createFlipItem(analysisId, askingPrice);
      
      // Generate platform-specific listings
      const listingsResult = await generatePlatformListings(analysisId);
      
      setListings(listingsResult.listings);
      setFlipCreated(true);
      setShowListings(true);
      
    } catch (error: any) {
      setError(error.message || 'Failed to create flip item');
    } finally {
      setIsFlipping(false);
    }
  };

  const handleGenerateListings = async () => {
    try {
      setIsFlipping(true);
      setError(null);
      
      const result = await generatePlatformListings(analysisId);
      setListings(result.listings);
      setShowListings(true);
      
    } catch (error: any) {
      setError(error.message || 'Failed to generate listings');
    } finally {
      setIsFlipping(false);
    }
  };

  if (flipCreated) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-green-900">
            🎉 Ready to Flip!
          </h3>
        </div>
        
        <p className="text-green-700 mb-4">
          Your {productName} has been added to the community marketplace and platform listings have been generated!
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => setShowListings(!showListings)}
            className="btn btn-secondary w-full"
          >
            {showListings ? 'Hide' : 'Show'} Platform Listings
          </button>
          
          {showListings && listings && (
            <PlatformListings listings={listings} productName={productName} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Zap className="w-6 h-6 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Ready to FLIP this item?
        </h3>
      </div>
      
      <p className="text-gray-600 mb-4">
        Generate marketplace listings and add to the community for local buyers to find!
      </p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your asking price (${estimatedValue.currency})
          </label>
          <input
            type="number"
            value={askingPrice}
            onChange={(e) => setAskingPrice(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            min="1"
          />
          <p className="text-xs text-gray-500 mt-1">
            Estimated value: ${estimatedValue.low} - ${estimatedValue.high}
          </p>
        </div>
        
        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        <div className="flex space-x-3">
          <button
            onClick={handleFlipItem}
            disabled={isFlipping}
            className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>{isFlipping ? 'Creating...' : 'FLIP This Item'}</span>
          </button>
          
          <button
            onClick={handleGenerateListings}
            disabled={isFlipping}
            className="btn btn-secondary flex items-center justify-center space-x-2"
          >
            <Copy className="w-4 h-4" />
            <span>Listings Only</span>
          </button>
        </div>
        
        <div className="text-xs text-gray-500">
          <p>• Generates copy for eBay, Facebook, Amazon, and more</p>
          <p>• Adds to local community marketplace</p>
          <p>• Notifies users looking for this item</p>
        </div>
      </div>
    </div>
  );
}