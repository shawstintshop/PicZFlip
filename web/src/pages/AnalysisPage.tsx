import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AnalysisProgress from '../components/AnalysisProgress';
import { ResultsDisplay } from '../components/ResultsDisplay';
import { getAnalysis } from '../services/api';

export default function AnalysisPage() {
  const { analysisId } = useParams<{ analysisId: string }>();
  const [analysis, setAnalysis] = useState<any>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let timeout: any;
    if (!analysis && analysisId) {
      // Try an immediate fetch so we can show any existing data
      getAnalysis(analysisId).then(setAnalysis).catch(() => {});
    }
    return () => clearTimeout(timeout);
  }, [analysisId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analysis</h1>
        <p className="text-gray-500 text-sm">ID: {analysisId}</p>
      </div>

      {!completed && analysisId && (
        <AnalysisProgress
          analysisId={analysisId}
          onComplete={(data) => {
            setAnalysis(data);
            setCompleted(true);
          }}
        />
      )}

      {analysis && completed && (
        <div className="mt-6">
          <ResultsDisplay analysis={analysis} />
        </div>
      )}
    </div>
  );
}
