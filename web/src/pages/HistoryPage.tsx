import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserHistory } from '../services/api';
import { Clock, Search, DollarSign, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';

interface AnalysisEntry {
  id: string;
  status: string;
  createdAt: any;
  item?: {
    category?: string;
    details?: {
      productName?: string;
      brand?: string;
      condition?: string;
    };
    confidence?: number;
  };
  pricing?: {
    averagePrice?: number;
    medianPrice?: number;
    suggestedPrice?: { mid?: number };
  };
  totalDuration?: number;
  summary?: {
    productName?: string;
    brand?: string;
    category?: string;
    confidence?: number;
  };
}

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserHistory();
      setAnalyses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'error': case 'failed': return 'bg-red-100 text-red-800';
      case 'processing': case 'identifying': case 'searching': case 'pricing': case 'copywriting':
        return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function formatDate(timestamp: any): string {
    if (!timestamp) return 'Unknown';
    const date = timestamp._seconds ? new Date(timestamp._seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600">Loading your analysis history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analysis History</h1>
          <p className="text-gray-600 mt-1">{analyses.length} total analyses</p>
        </div>
        <button onClick={loadHistory} className="btn btn-secondary text-sm flex items-center gap-2">
          <Search className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {analyses.length === 0 && !error ? (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No analyses yet</h2>
          <p className="text-gray-500 mb-6">Upload a photo to start your first product analysis.</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Start Analysis
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {analyses.map((entry) => {
            const name = entry.summary?.productName || entry.item?.details?.productName || 'Unknown Item';
            const brand = entry.summary?.brand || entry.item?.details?.brand || '';
            const category = entry.summary?.category || entry.item?.category || '';
            const price = entry.pricing?.suggestedPrice?.mid || entry.pricing?.medianPrice || entry.pricing?.averagePrice;

            return (
              <div
                key={entry.id}
                onClick={() => navigate(`/analysis/${entry.id}`)}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                        {entry.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {brand && <span>{brand}</span>}
                      {category && <span className="capitalize">{category}</span>}
                      {entry.totalDuration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {Math.round(entry.totalDuration / 1000)}s
                        </span>
                      )}
                      <span>{formatDate(entry.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    {price && price > 0 && (
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <DollarSign className="w-4 h-4" />
                          {price.toFixed(2)}
                        </div>
                        <span className="text-xs text-gray-400">suggested</span>
                      </div>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
