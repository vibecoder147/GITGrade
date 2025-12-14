import React, { useState } from 'react';
import { AnalysisStatus } from '../types';

interface InputFormProps {
  onSubmit: (url: string) => void;
  status: AnalysisStatus;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, status }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onSubmit(url);
  };

  const isLoading = status === AnalysisStatus.ANALYZING || status === AnalysisStatus.FETCHING_REPO;

  const isIdle = status === AnalysisStatus.IDLE || status === AnalysisStatus.ERROR || status === AnalysisStatus.COMPLETED;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        <span className="bg-blue-600 w-2 h-6 mr-3 rounded-sm"></span>
        Submission Data
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            GitHub Repository URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <svg className="h-5 w-5 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                 <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
               </svg>
            </div>
            <input
              type="url"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-500"
              placeholder="https://github.com/username/repository"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={!isIdle}
              required
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
             Note: Must be a public repository. Large repos may be truncated.
          </p>
        </div>

        <button
          type="submit"
          disabled={!isIdle || !url.includes('github.com')}
          className={`w-full py-4 px-6 rounded-lg font-bold text-white tracking-wide transition-all shadow-lg
            ${!isIdle 
              ? 'bg-slate-700 cursor-not-allowed opacity-70' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/25 active:transform active:scale-[0.98]'
            }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'START AUDIT'
          )}
        </button>
      </form>
    </div>
  );
};
