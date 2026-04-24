import React from 'react';

const MoodInsights = ({ data }) => {
  const hasData = data && Object.keys(data).length > 0;
  return (
    <div className="w-full mb-8">
      {!hasData ? (
        <div className="p-10 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
          <p className="text-gray-400 font-medium italic">Keep writing to see your mood correlations ✨</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(data).map(([tag, counts]) => (
            <div key={tag} className="bg-white p-6 rounded-[2rem] border border-indigo-50 shadow-sm transition-all hover:shadow-md">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">#{tag} Impact</h4>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className={counts.positive >= counts.negative ? 'text-green-500' : 'text-orange-400'}>
                  {counts.positive >= counts.negative ? '✨ Uplifting' : '☁️ Heavy'}
                </span>
                <div className="flex gap-2 text-[10px]">
                  <span className="text-green-400">+{counts.positive}</span>
                  <span className="text-red-300">-{counts.negative}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MoodInsights;