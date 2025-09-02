import { TrendingUp, DollarSign, Globe, Clock, CheckCircle } from 'lucide-react';

interface ResultsDisplayProps {
  analysis: any;
}

export function ResultsDisplay({ analysis }: ResultsDisplayProps) {
  if (!analysis) return null;

  const { item, searchResults, pricing, copy } = analysis;
  const successfulSearches = searchResults?.filter((r: any) => r.success) || [];
  const totalItems = searchResults?.reduce((sum: number, r: any) => sum + r.items.length, 0) || 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Analysis Complete! 🎉
        </h2>
        <p className="text-xl text-gray-600">
          Here's what we found for your {item?.category || 'item'}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Globe className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{successfulSearches.length}</div>
          <div className="text-sm text-gray-600">Sources Searched</div>
        </div>
        
        <div className="bg-white rounded-lg border p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{totalItems}</div>
          <div className="text-sm text-gray-600">Items Found</div>
        </div>
        
        <div className="bg-white rounded-lg border p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {pricing?.medianPrice ? `$${pricing.medianPrice}` : 'N/A'}
          </div>
          <div className="text-sm text-gray-600">Median Price</div>
        </div>
        
        <div className="bg-white rounded-lg border p-6 text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {analysis.totalDuration ? `${Math.round(analysis.totalDuration / 1000)}s` : 'N/A'}
          </div>
          <div className="text-sm text-gray-600">Total Time</div>
        </div>
      </div>

      {/* Item Details */}
      <div className="bg-white rounded-lg border p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Identified Item</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Category</p>
            <p className="font-medium text-gray-900">{item?.category || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Condition</p>
            <p className="font-medium text-gray-900">{item?.condition || 'Unknown'}</p>
          </div>
          {item?.brand && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Brand</p>
              <p className="font-medium text-gray-900">{item.brand}</p>
            </div>
          )}
          {item?.model && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Model</p>
              <p className="font-medium text-gray-900">{item.model}</p>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Analysis */}
      {pricing && (
        <div className="bg-white rounded-lg border p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Pricing Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Low Price</p>
              <p className="text-2xl font-bold text-green-600">
                ${pricing.lowPrice || 'N/A'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Median Price</p>
              <p className="text-2xl font-bold text-blue-600">
                ${pricing.medianPrice || 'N/A'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">High Price</p>
              <p className="text-2xl font-bold text-red-600">
                ${pricing.highPrice || 'N/A'}
              </p>
            </div>
          </div>
          {pricing.sampleSize && (
            <p className="text-sm text-gray-500 text-center mt-4">
              Based on {pricing.sampleSize} listings
            </p>
          )}
        </div>
      )}

      {/* Top Results */}
      {successfulSearches.length > 0 && (
        <div className="bg-white rounded-lg border p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Top Results</h3>
          <div className="space-y-4">
            {successfulSearches.slice(0, 5).map((result: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{result.sourceName}</p>
                    <p className="text-sm text-gray-500">{result.items.length} items found</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Search time</p>
                  <p className="font-medium text-gray-900">{result.searchTime}ms</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Copy */}
      {copy && (
        <div className="bg-white rounded-lg border p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Ready-to-Use Copy</h3>
          <div className="space-y-4">
            {copy.platforms?.map((platform: any, index: number) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{platform.name}</h4>
                <p className="text-gray-700 mb-2">{platform.description}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Suggested price:</span>
                  <span className="font-medium text-green-600">${platform.suggestedPrice}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Next Steps</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-white text-xs font-bold">1</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Review the pricing data</p>
              <p className="text-sm text-gray-600">Compare prices across different platforms</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-white text-xs font-bold">2</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Choose your selling platform</p>
              <p className="text-sm text-gray-600">Pick the best marketplace for your item</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-white text-xs font-bold">3</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Use the generated copy</p>
              <p className="text-sm text-gray-600">Copy the optimized description</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-white text-xs font-bold">4</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">List and sell</p>
              <p className="text-sm text-gray-600">Start earning from your flip</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="text-center mt-8">
        <button className="btn btn-primary btn-lg mr-4">
          <TrendingUp className="w-5 h-5 mr-2" />
          View Detailed Results
        </button>
        <button className="btn btn-secondary btn-lg">
          Analyze Another Item
        </button>
      </div>
    </div>
  );
}
