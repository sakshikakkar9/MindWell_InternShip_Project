import React from 'react';

const VersionComparison = ({ current, history, onClose }) => {
  if (!history || history.length === 0) {
    return (
      <div className="fixed inset-0 bg-primary/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="glass rounded-3xl p-10 max-w-lg w-full text-center fade-in">
          <h3 className="text-2xl font-serif font-bold text-primary mb-4">No Version History</h3>
          <p className="text-secondary mb-8">This entry hasn't been edited yet, so there are no previous versions to compare.</p>
          <button onClick={onClose} className="btn-primary w-full max-w-[200px] mx-auto">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-primary/20 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-cream/90 backdrop-blur-xl rounded-[2.5rem] w-full max-w-6xl my-8 shadow-soft overflow-hidden flex flex-col max-h-[90vh] border border-white/40 fade-in">
        <div className="p-8 bg-white/40 border-b border-white/20 flex justify-between items-center">
          <div>
            <h3 className="text-3xl font-serif font-bold text-primary">Entry Evolution</h3>
            <p className="text-secondary/60 text-[10px] font-bold uppercase tracking-widest mt-2">Comparing: {current.title}</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/60 hover:bg-white text-secondary rounded-2xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shadow-soft">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-x-auto p-8">
          <div className="flex gap-8 min-w-max pb-4">
            {/* Current Version */}
            <div className="w-80 md:w-96 flex-shrink-0">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-2 w-2 bg-sage rounded-full shadow-[0_0_8px_rgba(163,177,138,0.5)]"></span>
                <h4 className="text-[10px] font-bold text-primary uppercase tracking-tighter">Current Version</h4>
              </div>
              <div className="bg-white/80 p-8 rounded-3xl border-2 border-sage shadow-soft min-h-[400px]">
                 <p className="text-[10px] font-bold text-secondary/40 uppercase mb-4">{new Date(current.date).toLocaleString()}</p>
                 <h5 className="text-lg font-serif font-bold text-primary mb-4">{current.title}</h5>
                 <p className="text-secondary text-sm leading-relaxed whitespace-pre-wrap italic">{current.content}</p>
                 <div className="mt-6 flex flex-wrap gap-2">
                    {current.tags.map((tag, i) => <span key={i} className="text-[9px] bg-sage/10 text-sage-dark px-2 py-1 rounded-lg">#{tag}</span>)}
                 </div>
              </div>
            </div>

            {/* History Versions */}
            {history.slice().reverse().map((version, index) => (
              <div key={index} className="w-80 md:w-96 flex-shrink-0">
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-2 w-2 bg-secondary/20 rounded-full"></span>
                  <h4 className="text-[10px] font-bold text-secondary/40 uppercase tracking-tighter">Version {history.length - index}</h4>
                </div>
                <div className="bg-white/40 p-8 rounded-3xl border border-white/40 min-h-[400px] opacity-80 hover:opacity-100 transition-opacity">
                   <p className="text-[10px] font-bold text-secondary/30 uppercase mb-4">{new Date(version.updatedAt).toLocaleString()}</p>
                   <h5 className="text-lg font-serif font-bold text-secondary mb-4">{version.title}</h5>
                   <p className="text-secondary/70 text-sm leading-relaxed whitespace-pre-wrap italic">{version.content}</p>
                   <div className="mt-6 flex flex-wrap gap-2">
                      {version.tags.map((tag, i) => <span key={i} className="text-[9px] bg-secondary/5 text-secondary/40 px-2 py-1 rounded-lg">#{tag}</span>)}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 bg-white/40 border-t border-white/20 text-center">
            <p className="text-sm text-secondary/60 font-serif italic">"We are not the same person we were a second ago."</p>
        </div>
      </div>
    </div>
  );
};

export default VersionComparison;
