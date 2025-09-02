import { useState } from 'react';
import { PhotoUploader } from '../components/PhotoUploader';
import AnalysisProgress from '../components/AnalysisProgress';
import { ResultsDisplay } from '../components/ResultsDisplay';
import { Zap, Shield, Globe } from 'lucide-react';

export default function HomePage() {
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const [analysisProgress, setAnalysisProgress] = useState<string | null>(null);

  const handleAnalysisStart = (analysisId: string) => {
    setAnalysisProgress(analysisId);
    setCurrentAnalysis(null);
  };

  const handleAnalysisComplete = (analysis: any) => {
    setCurrentAnalysis(analysis);
    setAnalysisProgress(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              PicZFlip
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              The most comprehensive item identification and marketplace research platform. 
              Search 200+ websites with AI-powered insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn btn-white btn-lg">
                Get Started
              </button>
              <button className="btn btn-outline-white btn-lg">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">200+</div>
              <div className="text-gray-600">Marketplaces</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">AI</div>
              <div className="text-gray-600">Powered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">Real-time</div>
              <div className="text-gray-600">Results</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-gray-600">Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Start Your Analysis
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload a photo of any item and let our AI identify it, then search hundreds of marketplaces 
            to find the best selling opportunities.
          </p>
        </div>

        {/* Photo Uploader */}
        <div className="mb-16">
          <PhotoUploader onAnalysisStart={handleAnalysisStart} />
        </div>

        {/* Analysis Progress */}
        {analysisProgress && (
          <div className="mb-16">
            <AnalysisProgress 
              analysisId={analysisProgress} 
              onComplete={handleAnalysisComplete} 
            />
          </div>
        )}

        {/* Results Display */}
        {currentAnalysis && (
          <div className="mb-16">
            <ResultsDisplay analysis={currentAnalysis} />
          </div>
        )}

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
            <p className="text-gray-600">
              Get comprehensive results in minutes, not hours. Our parallel processing searches 
              all sources simultaneously.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Reliable Results</h3>
            <p className="text-gray-600">
              Built with fault tolerance in mind. If one source fails, others continue working 
              to ensure you get results.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Coverage</h3>
            <p className="text-gray-600">
              Search local, national, and international marketplaces to find the best opportunities 
              wherever you are.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
