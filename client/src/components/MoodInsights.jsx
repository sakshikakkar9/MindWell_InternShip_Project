// components/MoodInsights.jsx
import React from 'react';

const MoodInsights = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.keys(data).map(key => (
        <div key={key} className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
          <h4 className="text-xs font-black text-indigo-400 uppercase mb-2">{key} Correlation</h4>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-2xl font-bold text-indigo-900">
                {data[key].positive > data[key].negative ? '📈 Positive' : '📉 Challenging'}
              </p>
              <p className="text-[10px] text-indigo-400 mt-1">Based on keyword matching</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-green-500">+{data[key].positive}</span>
              <span className="text-xs font-bold text-red-400 ml-2">-{data[key].negative}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MoodInsights;