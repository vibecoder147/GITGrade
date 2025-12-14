import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface ScoreChartProps {
  score: number;
}

export const ScoreChart: React.FC<ScoreChartProps> = ({ score }) => {
  const data = [{ name: 'Score', value: score }];
  
  // Determine color based on score
  let fill = '#ef4444'; // Red (bad)
  if (score >= 50) fill = '#eab308'; // Yellow (ok)
  if (score >= 70) fill = '#3b82f6'; // Blue (good)
  if (score >= 90) fill = '#22c55e'; // Green (excellent)

  const getBadge = (s: number) => {
    if (s >= 90) return { label: 'GOLD', icon: '🏆', color: 'text-yellow-400', border: 'border-yellow-500/50 bg-yellow-500/10' };
    if (s >= 75) return { label: 'SILVER', icon: '🥈', color: 'text-slate-300', border: 'border-slate-400/50 bg-slate-500/10' };
    return { label: 'BRONZE', icon: '🥉', color: 'text-amber-700', border: 'border-amber-700/50 bg-amber-700/10' };
  };

  const badge = getBadge(score);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div className="h-48 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="65%" 
            outerRadius="100%" 
            barSize={15} 
            data={data} 
            startAngle={180} 
            endAngle={0}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background
              dataKey="value"
              cornerRadius={10}
              fill={fill}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
            <span className="text-5xl font-bold text-white tracking-tighter">{score}</span>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">GitGrade</span>
        </div>
      </div>

      <div className={`mt-2 px-4 py-1.5 rounded-full border flex items-center gap-2 ${badge.border} backdrop-blur-sm`}>
        <span className="text-lg">{badge.icon}</span>
        <span className={`text-sm font-bold tracking-widest ${badge.color}`}>{badge.label}</span>
      </div>
    </div>
  );
};