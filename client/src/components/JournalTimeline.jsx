import React from 'react';

const JournalTimeline = ({ entries }) => {
  // Sort entries to ensure the newest is always at the top of the timeline
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="max-w-4xl w-full px-4 py-10 animate-fade-in">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-12">
        <h3 className="text-2xl font-black text-gray-800 flex items-center gap-3">
          <span className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-200 text-sm">
            📅
          </span>
          Your Personal Timeline
        </h3>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
          {entries.length} {entries.length === 1 ? 'Entry' : 'Entries'}
        </span>
      </div>

      {/* Vertical Timeline Wrapper */}
      <div className="relative border-l-2 border-indigo-100 ml-4 md:ml-8">
        {sortedEntries.map((entry, index) => (
          <div key={entry._id || index} className="mb-12 ml-8 group relative">
            
            {/* The Timeline Connector Dot */}
            <div className="absolute w-5 h-5 bg-white border-4 border-indigo-500 rounded-full -left-[42px] top-1.5 group-hover:scale-125 group-hover:bg-indigo-600 transition-all duration-300 z-10 shadow-sm"></div>
            
            {/* Subtle Date Indicator */}
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mb-3">
              <time className="text-xs font-black uppercase tracking-tighter text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">
                {new Date(entry.date).toLocaleDateString('en-US', { 
                  month: 'short', day: 'numeric', year: 'numeric' 
                })}
              </time>
              <h4 className="text-xl font-bold text-gray-800 capitalize group-hover:text-indigo-600 transition-colors duration-300">
                {entry.title || "Untitled Reflection"}
              </h4>
            </div>

            {/* Content Card */}
            <div className="relative bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-500 group-hover:-translate-y-1">
              {/* Decorative Quote Mark */}
              <span className="absolute top-4 right-6 text-4xl text-gray-50 font-serif pointer-events-none">"</span>
              
              <p className="text-gray-600 text-base leading-relaxed whitespace-pre-wrap italic relative z-10">
                {entry.content}
              </p>
              
              {/* Tag Cloud */}
              <div className="mt-5 flex flex-wrap gap-2">
                {entry.tags && entry.tags.length > 0 ? (
                  entry.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className="text-[10px] bg-gray-50 text-gray-500 border border-gray-100 px-3 py-1 rounded-lg uppercase font-black tracking-widest hover:bg-indigo-600 hover:text-white transition-colors cursor-default"
                    >
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-gray-300 italic">#no-tags</span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* End of Journey Marker */}
        <div className="ml-8 mt-4">
          <p className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-gray-200 rounded-full"></span>
            End of Timeline
          </p>
        </div>
      </div>
    </div>
  );
};

export default JournalTimeline;