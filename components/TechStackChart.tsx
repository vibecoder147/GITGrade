import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { LanguageStat } from '../types';

interface TechStackChartProps {
  data: LanguageStat[];
}

export const TechStackChart: React.FC<TechStackChartProps> = ({ data }) => {
  // Vibrant colors for the chart
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

  if (!data || data.length === 0) {
    return (
        <div className="h-64 w-full bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center justify-center text-slate-500">
            No language data available
        </div>
    );
  }

  return (
    <div className="h-64 w-full bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-lg">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-700 pb-2">
        Tech Stack Distribution
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
            >
                {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#e2e8f0' }}
            />
            <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} 
            />
            </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};