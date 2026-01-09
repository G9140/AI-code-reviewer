import { useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CodeDisplayProps {
  code: string;
  language: string;
}

export default function CodeDisplay({ code, language }: CodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (window.Prism) {
      window.Prism.highlightAllUnder(document.querySelector('.code-display'));
    }
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-display bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700">
        <span className="text-sm font-medium text-slate-400">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-3 py-1 text-sm hover:bg-slate-700 text-slate-400 hover:text-white rounded transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto">
        <pre className={`language-${language} p-4 m-0 text-sm`}>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
