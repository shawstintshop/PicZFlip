import { useState } from 'react';
import { Copy, CheckCircle, ExternalLink } from 'lucide-react';

interface PlatformListingsProps {
  listings: Record<string, any>;
  productName: string;
}

interface Platform {
  id: string;
  name: string;
  color: string;
  icon: string;
  url?: string;
}

const PLATFORMS: Platform[] = [
  { 
    id: 'facebook', 
    name: 'Facebook Marketplace', 
    color: 'bg-blue-500', 
    icon: '📘',
    url: 'https://www.facebook.com/marketplace/create/item'
  },
  { 
    id: 'ebay', 
    name: 'eBay', 
    color: 'bg-yellow-500', 
    icon: '🛒',
    url: 'https://www.ebay.com/sell/create'
  },
  { 
    id: 'craigslist', 
    name: 'Craigslist', 
    color: 'bg-purple-500', 
    icon: '📋',
    url: 'https://craigslist.org'
  },
  { 
    id: 'offerup', 
    name: 'OfferUp', 
    color: 'bg-green-500', 
    icon: '🏪',
    url: 'https://offerup.com/sell'
  },
  { 
    id: 'mercari', 
    name: 'Mercari', 
    color: 'bg-red-500', 
    icon: '🛍️',
    url: 'https://www.mercari.com/sell'
  },
  { 
    id: 'amazon', 
    name: 'Amazon', 
    color: 'bg-orange-500', 
    icon: '📦',
    url: 'https://sellercentral.amazon.com'
  }
];

export function PlatformListings({ listings, productName }: PlatformListingsProps) {
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  const copyToClipboard = async (text: string, platformId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPlatform(platformId);
      setTimeout(() => setCopiedPlatform(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const availableListings = PLATFORMS.filter(platform => 
    listings[platform.id] && !listings[platform.id].error
  );

  if (availableListings.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          No platform listings available. Please check your platform preferences.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900">
          Platform Listings for {productName}
        </h4>
        <span className="text-sm text-gray-500">
          {availableListings.length} platform{availableListings.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="space-y-3">
        {availableListings.map(platform => {
          const listing = listings[platform.id];
          if (!listing || listing.error) return null;
          
          const fullListingText = `TITLE: ${listing.title}

DESCRIPTION:
${listing.description}

PRICE: $${listing.suggestedPrice}

KEYWORDS: ${listing.keywords?.join(', ') || 'N/A'}`;
          
          return (
            <div key={platform.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${platform.color} rounded-full flex items-center justify-center text-white text-sm`}>
                    {platform.icon}
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">{platform.name}</h5>
                    <p className="text-sm text-gray-500">Suggested price: ${listing.suggestedPrice}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(fullListingText, platform.id)}
                    className="btn btn-sm btn-secondary flex items-center space-x-1"
                  >
                    {copiedPlatform === platform.id ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span>{copiedPlatform === platform.id ? 'Copied!' : 'Copy'}</span>
                  </button>
                  
                  {platform.url && (
                    <a
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-primary flex items-center space-x-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>List</span>
                    </a>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    TITLE ({listing.title?.length || 0} characters)
                  </label>
                  <div className="bg-gray-50 p-2 rounded text-sm font-mono break-all">
                    {listing.title}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    DESCRIPTION
                  </label>
                  <div className="bg-gray-50 p-2 rounded text-sm font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {listing.description}
                  </div>
                </div>
                
                {listing.keywords && listing.keywords.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      KEYWORDS
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {listing.keywords.map((keyword: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-medium text-blue-900 mb-2">📋 How to Use These Listings</h5>
        <div className="text-sm text-blue-800 space-y-1">
          <p>1. Click "Copy" next to your preferred platform</p>
          <p>2. Click "List" to open the platform's selling page</p>
          <p>3. Paste the copied content into the appropriate fields</p>
          <p>4. Add your photos and adjust pricing if needed</p>
          <p>5. Publish your listing and start selling!</p>
        </div>
      </div>
    </div>
  );
}