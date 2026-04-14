import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MoodTrend = ({ entries }) => {
  if (!entries || entries.length === 0) return null;

  const data = entries.map(entry => ({
    name: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mood: entry.sentimentScore || 3,
    title: entry.title
  })).reverse();

  return (
    <div className="w-full h-80">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800">Mental Wellness Trends</h3>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Real-time Sentiment Flow</p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} dy={10} />
          <YAxis hide domain={[0, 5]} />
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
          />
          <Area 
            type="monotone" 
            dataKey="mood" 
            stroke="#6366f1" 
            strokeWidth={4} 
            fillOpacity={1} 
            fill="url(#colorMood)" 
            dot={{ r: 6, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoodTrend;