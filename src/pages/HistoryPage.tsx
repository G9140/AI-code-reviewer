import { useEffect, useState } from 'react';
import { Loader2, Code2, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SubmissionPreview {
  id: string;
  title: string;
  language: string;
  created_at: string;
  review: string;
}

interface HistoryPageProps {
  onSelectReview: (id: string) => void;
}

export default function HistoryPage({ onSelectReview }: HistoryPageProps) {
  const [submissions, setSubmissions] = useState<SubmissionPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { data, error } = await supabase
          .from('code_submissions')
          .select('id, title, language, created_at, review')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setSubmissions(data || []);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-2" />
          <p className="text-slate-400">Loading history...</p>
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
          <Code2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Code Reviews Yet</h3>
          <p className="text-slate-400">
            Submit your code to get started with AI-powered code reviews.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Review History</h2>
        <p className="text-slate-400">View all your submitted code reviews</p>
      </div>

      <div className="space-y-3">
        {submissions.map((submission) => {
          const isCompleted = submission.review && !submission.review.includes('Analyzing');

          return (
            <button
              key={submission.id}
              onClick={() => onSelectReview(submission.id)}
              className="w-full text-left p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800 hover:border-blue-500/50 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Code2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                      {submission.title}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-xs font-medium">
                      {submission.language}
                    </span>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-4 h-4" />
                      {new Date(submission.created_at).toLocaleDateString()}
                    </div>
                    {isCompleted ? (
                      <div className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        Review Complete
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-amber-400">
                        <Clock className="w-4 h-4" />
                        Analyzing...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
