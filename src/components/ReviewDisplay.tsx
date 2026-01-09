import { AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

interface Suggestion {
  title: string;
  description: string;
  severity: string;
}

interface ReviewDisplayProps {
  review: string;
  suggestions: Suggestion[];
  isLoading?: boolean;
}

const getSeverityIcon = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'error':
    case 'critical':
      return <AlertCircle className="w-5 h-5" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5" />;
    default:
      return <Info className="w-5 h-5" />;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'error':
    case 'critical':
      return 'from-red-500/10 to-red-500/5 border-red-500/30';
    case 'warning':
      return 'from-amber-500/10 to-amber-500/5 border-amber-500/30';
    default:
      return 'from-blue-500/10 to-blue-500/5 border-blue-500/30';
  }
};

const getSeverityBadgeColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'error':
    case 'critical':
      return 'bg-red-500/20 text-red-400';
    case 'warning':
      return 'bg-amber-500/20 text-amber-400';
    default:
      return 'bg-blue-500/20 text-blue-400';
  }
};

export default function ReviewDisplay({
  review,
  suggestions,
  isLoading = false,
}: ReviewDisplayProps) {
  const isAnalyzing = review.includes('Analyzing');

  return (
    <div className="space-y-6">
      {isAnalyzing && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin flex-shrink-0" />
          <p className="text-blue-400">AI is analyzing your code...</p>
        </div>
      )}

      {!isAnalyzing && (
        <>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 max-h-96 overflow-y-auto">
            <h4 className="font-semibold text-white mb-3">Review</h4>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{review}</div>
          </div>

          {suggestions && suggestions.length > 0 && (
            <div>
              <h4 className="font-semibold text-white mb-3">Suggestions ({suggestions.length})</h4>
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`bg-gradient-to-r ${getSeverityColor(
                      suggestion.severity
                    )} border rounded-lg p-4 transition-all hover:shadow-lg`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-slate-400 flex-shrink-0 mt-0.5">
                        {getSeverityIcon(suggestion.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-semibold text-white">{suggestion.title}</h5>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityBadgeColor(
                              suggestion.severity
                            )}`}
                          >
                            {suggestion.severity}
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm">{suggestion.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!suggestions || suggestions.length === 0) && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 text-center">
              <p className="text-emerald-400 font-medium">Great code! No suggestions needed.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
