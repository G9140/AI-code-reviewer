import { useState } from 'react';
import { Loader2, Send, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

const LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'c',
  'csharp',
  'php',
  'ruby',
  'go',
  'rust',
  'sql',
  'html',
  'css',
];

export default function SubmissionPage() {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) {
      alert('Please fill in title and code');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('code_submissions')
        .insert([
          {
            title,
            code,
            language,
            review: 'Analyzing your code...',
            suggestions: [],
          },
        ])
        .select('id')
        .single();

      if (error) throw error;

      setSubmittedId(data.id);
      setSubmitted(true);

      const reviewUrl = `${window.location.origin}?review=${data.id}`;
      await triggerCodeReview(data.id, code, language);
    } catch (error) {
      console.error('Error submitting code:', error);
      alert('Failed to submit code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const triggerCodeReview = async (id: string, codeContent: string, lang: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/review-code`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            id,
            code: codeContent,
            language: lang,
          }),
        }
      );

      if (!response.ok) {
        console.error('Failed to trigger code review');
      }
    } catch (error) {
      console.error('Error triggering code review:', error);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}?review=${submittedId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setTitle('');
    setCode('');
    setLanguage('javascript');
    setSubmitted(false);
    setSubmittedId('');
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-4">
            <Check className="w-6 h-6 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Code Submitted Successfully!</h2>
          <p className="text-slate-400 mb-6">
            Your code is being analyzed by AI. The review will be ready shortly.
          </p>

          <div className="bg-slate-800/50 rounded-lg p-4 mb-6 text-left">
            <p className="text-slate-400 text-sm mb-2">Submission ID:</p>
            <div className="flex items-center gap-2">
              <code className="text-blue-400 font-mono text-sm flex-1 break-all">{submittedId}</code>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Submit Another Code
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Submit Your Code</h2>
        <p className="text-slate-400">
          Paste your code below and get instant AI-powered suggestions for improvement.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Project Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="E.g., User Authentication Module"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Programming Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Lines of Code
            </label>
            <div className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-400">
              {code.split('\n').length}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Code
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            rows={16}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Get AI Review
            </>
          )}
        </button>
      </form>
    </div>
  );
}
