import { useParams } from 'react-router-dom';

export default function AnalysisPage() {
  const { analysisId } = useParams<{ analysisId: string }>();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Analysis Details
        </h1>
        <p className="text-gray-600">
          Analysis ID: {analysisId}
        </p>
        <p className="text-gray-500 text-sm mt-2">
          This page will display detailed analysis results.
        </p>
      </div>
    </div>
  );
}
