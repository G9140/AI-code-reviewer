import { useState } from 'react';
import { Code2 } from 'lucide-react';
import SubmissionPage from './pages/SubmissionPage';
import ReviewPage from './pages/ReviewPage';
import HistoryPage from './pages/HistoryPage';

type Page = 'submit' | 'review' | 'history';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('submit');
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  const handleReviewSelect = (id: string) => {
    setSelectedReviewId(id);
    setCurrentPage('review');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Code2 className="w-8 h-8 text-blue-400" />
              <h1 className="text-xl font-bold text-white">CodeReview AI</h1>
            </div>
            <nav className="flex gap-1">
              <button
                onClick={() => setCurrentPage('submit')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'submit'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                Submit Code
              </button>
              <button
                onClick={() => setCurrentPage('history')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'history'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                History
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'submit' && <SubmissionPage />}
        {currentPage === 'review' && selectedReviewId && (
          <ReviewPage id={selectedReviewId} onBack={() => setCurrentPage('submit')} />
        )}
        {currentPage === 'history' && (
          <HistoryPage onSelectReview={handleReviewSelect} />
        )}
      </main>
    </div>
  );
}

export default App;
