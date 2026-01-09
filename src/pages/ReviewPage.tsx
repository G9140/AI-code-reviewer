import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import CodeDisplay from '../components/CodeDisplay';
import ReviewDisplay from '../components/ReviewDisplay';

interface Submission {
  id: string;
  title: string;
  code: string;
  language: string;
  review: string;
  suggestions: { title: string; description: string; severity: string }[];
  created_at: string;
}

interface ReviewPageProps {
  id: string;
  onBack: () => void;
}

export default function ReviewPage({ id, onBack }: ReviewPageProps) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('code_submissions')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (fetchError) throw fetchError;
        if (!data) {
          setError('Submission not found');
          return;
        }

        setSubmission(data);
      } catch (err) {
        console.error('Error fetching submission:', err);
        setError('Failed to load submission');
      } finally {
        setLoading(false);
      }
    };

    const pollForReview = async () => {
      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts) {
        const { data } = await supabase
          .from('code_submissions')
          .select('review, suggestions')
          .eq('id', id)
          .maybeSingle();

        if (data && data.review && !data.review.includes('Analyzing')) {
          break;
        }

        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    };

    fetchSubmission();
    pollForReview();

    const interval = setInterval(fetchSubmission, 2000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-2" />
          <p className="text-slate-400">Loading review...</p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-white font-medium">{error || 'Submission not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">{submission.title}</h2>
        <p className="text-slate-400">
          Submitted on {new Date(submission.created_at).toLocaleDateString()} at{' '}
          {new Date(submission.created_at).toLocaleTimeString()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Source Code</h3>
          <CodeDisplay code={submission.code} language={submission.language} />
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-4">AI Review</h3>
          <ReviewDisplay
            review={submission.review}
            suggestions={submission.suggestions}
            isLoading={submission.review.includes('Analyzing')}
          />
        </div>
      </div>
    </div>
  );
}
