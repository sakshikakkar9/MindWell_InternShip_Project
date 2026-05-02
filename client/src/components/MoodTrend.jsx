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
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#A3B18A" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#A3B18A" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(107, 112, 92, 0.1)" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B705C', fontSize: 10, fontWeight: 600}} dy={10} />
          <YAxis hide domain={[0, 5]} />
          <Tooltip 
            contentStyle={{
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(8px)',
              color: '#344E41'
            }}
            itemStyle={{ color: '#A3B18A', fontWeight: 'bold' }}
          />
          <Area 
            type="monotone" 
            dataKey="mood" 
            stroke="#A3B18A"
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorMood)" 
            dot={{ r: 4, fill: '#A3B18A', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, fill: '#8A9A73' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoodTrend;
