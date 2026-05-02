// components/MoodInsights.jsx
import React from 'react';

const MoodInsights = ({ data }) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Object.keys(data).slice(0, 3).map(key => (
        <div key={key} className="bg-sage/5 p-5 rounded-2xl border border-sage/10 transition-all hover:bg-sage/10">
          <h4 className="text-[10px] font-bold text-sage-dark uppercase tracking-widest mb-2">{key} Correlation</h4>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xl font-serif font-bold text-primary">
                {data[key].positive > data[key].negative ? '✨ Positive' : '☁️ Challenging'}
              </p>
              <p className="text-[10px] text-secondary mt-1">Based on keyword matching</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-sage">+{data[key].positive}</span>
              <span className="text-xs font-bold text-terracotta ml-2">-{data[key].negative}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MoodInsights;
