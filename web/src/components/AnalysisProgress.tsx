import { useState, useEffect } from 'react';
import { Camera, Search, Calculator, PenTool, CheckCircle, AlertCircle, BarChart3, Zap } from 'lucide-react';
import { getAnalysis } from '../services/api';

interface AnalysisProgressProps {
  analysisId: string;
  onComplete: (analysis: any) => void;
}

export default function AnalysisProgress({ analysisId, onComplete }: AnalysisProgressProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const pollAnalysis = async () => {
      try {
        const data = await getAnalysis(analysisId);
        setAnalysis(data);
        
        if (data.status === 'completed') {
          onComplete(data);
        } else if (data.status === 'error') {
          setError(data.error?.message || 'Analysis failed');
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    const interval = setInterval(pollAnalysis, 2000);
    pollAnalysis(); // Initial call

    return () => clearInterval(interval);
  }, [analysisId, onComplete]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="text-red-600" size={24} />
          <span className="text-red-800 font-medium text-lg">Analysis Failed</span>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-danger"
        >
          Try Again
        </button>
      </div>
    );
  }

  const stages = [
    { 
      key: 'identification', 
      label: 'Identifying Item', 
      icon: Camera,
      description: 'AI is analyzing your photo to identify the item and category'
    },
    { 
      key: 'routing', 
      label: 'Planning Search', 
      icon: Search,
      description: 'Determining which marketplaces to search based on item type'
    },
    { 
      key: 'searching', 
      label: 'Searching Markets', 
      icon: Search,
      description: 'Searching hundreds of marketplaces simultaneously'
    },
    { 
      key: 'aggregating', 
      label: 'Aggregating Results', 
      icon: BarChart3,
      description: 'Combining and organizing data from all sources'
    },
    { 
      key: 'pricing', 
      label: 'Analyzing Prices', 
      icon: Calculator,
      description: 'Calculating market trends and pricing insights'
    },
    { 
      key: 'copywriting', 
      label: 'Generating Copy', 
      icon: PenTool,
      description: 'Creating optimized selling descriptions for each platform'
    },
    { 
      key: 'validation', 
      label: 'Final Review', 
      icon: CheckCircle,
      description: 'Validating results and preparing your report'
    }
  ];

  const currentStage = analysis?.status || 'identification';
  const completedStages = analysis?.stages || {};

  return (
    <div className="bg-white rounded-lg border shadow-lg p-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Item</h3>
        <p className="text-gray-600 text-lg">Searching hundreds of marketplaces...</p>
      </div>

      <div className="space-y-6">
        {stages.map((stage) => {
          const isCompleted = completedStages[stage.key]?.completed;
          const isCurrent = currentStage === stage.key;
          
          return (
            <div key={stage.key} className="flex items-start gap-4">
              {/* Stage Icon */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                isCompleted ? 'bg-green-100 text-green-600' :
                isCurrent ? 'bg-blue-100 text-blue-600' :
                'bg-gray-100 text-gray-400'
              }`}>
                <stage.icon size={20} />
              </div>
              
              {/* Stage Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className={`font-semibold text-lg ${
                    isCompleted ? 'text-green-900' :
                    isCurrent ? 'text-blue-900' :
                    'text-gray-500'
                  }`}>
                    {stage.label}
                  </h4>
                  
                  {isCompleted && <CheckCircle className="text-green-600" size={20} />}
                  {isCurrent && (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                
                <p className={`text-sm ${
                  isCompleted ? 'text-green-700' :
                  isCurrent ? 'text-blue-700' :
                  'text-gray-500'
                }`}>
                  {stage.description}
                </p>
                
                {completedStages[stage.key] && (
                  <div className="text-xs text-gray-500 mt-2">
                    Completed in {completedStages[stage.key].duration}ms
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Summary */}
      {analysis?.searchResults && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {analysis.searchResults.filter((r: any) => r.success).length}
              </div>
              <div className="text-sm text-blue-700">Sources Searched</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {analysis.searchResults.reduce((sum: number, r: any) => sum + r.items.length, 0)}
              </div>
              <div className="text-sm text-green-700">Items Found</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {analysis.searchResults.length}
              </div>
              <div className="text-sm text-purple-700">Total Sources</div>
            </div>
          </div>
        </div>
      )}

      {/* Estimated Time */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          Estimated completion: 2-5 minutes
        </div>
      </div>
    </div>
  );
}
