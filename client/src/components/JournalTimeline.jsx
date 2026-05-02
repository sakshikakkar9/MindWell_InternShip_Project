import React from 'react';

const JournalTimeline = ({ entries, onEdit, onCompare }) => {
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="max-w-4xl w-full py-6">
      {/* Vertical Timeline Wrapper */}
      <div className="relative border-l-2 border-sage/20 ml-4 md:ml-8">
        {sortedEntries.map((entry, index) => (
          <div key={entry._id || index} className="mb-12 ml-8 group relative fade-in">
            
            {/* The Timeline Connector Dot */}
            <div className="absolute w-4 h-4 bg-cream border-2 border-sage rounded-full -left-[41px] top-1.5 group-hover:scale-125 group-hover:bg-sage transition-all duration-300 z-10"></div>
            
            {/* Date Indicator */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-4 mb-4">
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                <time className="text-[10px] font-bold uppercase tracking-widest text-sage-dark bg-sage/10 px-3 py-1 rounded-full">
                  {new Date(entry.date).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </time>
                <h4 className="text-xl font-serif font-bold text-primary group-hover:text-sage-dark transition-colors duration-300">
                  {entry.title || "Untitled Reflection"}
                </h4>
              </div>
              <div className="flex gap-2">
                {entry.versionHistory && entry.versionHistory.length > 0 && (
                  <button
                    onClick={() => onCompare(entry)}
                    className="text-[10px] font-bold uppercase tracking-widest text-terracotta-dark bg-terracotta/10 px-3 py-1 rounded-full hover:bg-terracotta/20 transition-colors min-h-[32px] flex items-center"
                    title="View History"
                  >
                    History ({entry.versionHistory.length})
                  </button>
                )}
                <button
                  onClick={() => onEdit(entry)}
                  className="text-[10px] font-bold uppercase tracking-widest text-sage-dark bg-sage/10 px-3 py-1 rounded-full hover:bg-sage/20 transition-colors min-h-[32px] flex items-center"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Content Card */}
            <div className="relative bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-white/40 shadow-soft hover:shadow-md transition-all duration-500 group-hover:-translate-y-1">
              <p className="text-secondary text-base leading-relaxed whitespace-pre-wrap italic">
                {entry.content}
              </p>
              
              {/* Tag Cloud */}
              <div className="mt-6 flex flex-wrap gap-2">
                {entry.tags && entry.tags.length > 0 ? (
                  entry.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className="text-[10px] bg-cream text-secondary border border-secondary/10 px-3 py-1 rounded-lg uppercase font-bold tracking-widest hover:bg-sage hover:text-white transition-colors cursor-default"
                    >
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-secondary/30 italic">#no-tags</span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* End of Journey Marker */}
        <div className="ml-8 mt-4">
          <p className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-secondary/20 rounded-full"></span>
            End of Timeline
          </p>
        </div>
      </div>
    </div>
  );
};

export default JournalTimeline;
