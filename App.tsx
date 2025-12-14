import React, { useState } from 'react';
import { InputForm } from './components/InputForm';
import { AuditResult } from './components/AuditResult';
import { analyzeRepository } from './services/geminiService';
import { fetchGithubRepoData } from './services/githubService';
import { AuditResponse, AuditRequest, AnalysisStatus } from './types';

export default function App() {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [repoData, setRepoData] = useState<AuditRequest | null>(null);
  const [response, setResponse] = useState<AuditResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAuditRequest = async (url: string) => {
    setStatus(AnalysisStatus.FETCHING_REPO);
    setResponse(null);
    setRepoData(null);
    setError(null);
    
    // Smooth scroll to top when starting
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      // Step 1: Fetch Repo Data
      const data = await fetchGithubRepoData(url);
      setRepoData(data);
      
      // Step 2: Analyze with AI
      setStatus(AnalysisStatus.ANALYZING);
      const result = await analyzeRepository(data);
      
      setResponse(result);
      setStatus(AnalysisStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">G</div>
             <span className="text-xl font-bold tracking-tight text-white">
               Git<span className="text-blue-400">Grade</span>
             </span>
          </div>
          <div className="text-xs text-slate-500 font-mono hidden sm:block">
            v1.0.0 // AI ARCHITECT
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-5 space-y-6">
            <div className="prose prose-invert prose-sm mb-6">
              <h1 className="text-3xl font-extrabold text-white mb-2">Automated Code Audit</h1>
              <p className="text-slate-400 text-base">
                Paste a GitHub repository URL below. Our AI Architect will fetch the code, perform a deep-dive analysis, and assign a strict GitGrade.
              </p>
            </div>
            
            <InputForm onSubmit={handleAuditRequest} status={status} />

            {/* Error Display */}
            {status === AnalysisStatus.ERROR && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-200 text-sm flex items-start gap-3">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p>{error}</p>
              </div>
            )}
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-7">
            {status === AnalysisStatus.IDLE && (
              <div className="h-full min-h-[400px] border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-slate-900/30">
                <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <p className="text-lg font-medium">Ready for inspection</p>
                <p className="text-sm mt-2 max-w-sm">Submit your repository URL to receive your scorecard and roadmap.</p>
              </div>
            )}

            {status === AnalysisStatus.FETCHING_REPO && (
              <div className="h-full min-h-[400px] bg-slate-900 rounded-xl flex flex-col items-center justify-center p-8 relative overflow-hidden border border-slate-700">
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                 <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6 z-10"></div>
                 <h3 className="text-xl font-bold text-white z-10">Fetching Repository...</h3>
                 <p className="text-sm text-slate-400 mt-2 z-10">Downloading file tree and key source files.</p>
              </div>
            )}

            {status === AnalysisStatus.ANALYZING && (
              <div className="h-full min-h-[400px] bg-slate-900 rounded-xl flex flex-col items-center justify-center p-8 relative overflow-hidden border border-slate-700">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-6 z-10"></div>
                <h3 className="text-xl font-bold text-white z-10">Analyzing Architecture...</h3>
                <div className="mt-4 space-y-2 text-center z-10">
                  <p className="text-sm text-slate-400 animate-pulse">Scanning file structure...</p>
                  <p className="text-sm text-slate-400 animate-pulse delay-75">Checking design patterns...</p>
                  <p className="text-sm text-slate-400 animate-pulse delay-150">Calculating GitGrade...</p>
                </div>
              </div>
            )}

            {status === AnalysisStatus.COMPLETED && response && (
              <AuditResult response={response} repoData={repoData} />
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}