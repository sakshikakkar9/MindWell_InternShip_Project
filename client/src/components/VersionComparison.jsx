import React from 'react';

const VersionComparison = ({ current, history, onClose }) => {
  if (!history || history.length === 0) {
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2rem] p-10 max-w-lg w-full text-center">
          <h3 className="text-xl font-bold text-slate-800 mb-4">No Version History</h3>
          <p className="text-slate-500 mb-8">This entry hasn't been edited yet, so there are no previous versions to compare.</p>
          <button onClick={onClose} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-indigo-700">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-50 rounded-[2.5rem] w-full max-w-6xl my-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-indigo-950">Entry Evolution</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Comparing versions of: {current.title}</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl transition-colors">
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
                <span className="h-3 w-3 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Current Version</h4>
              </div>
              <div className="bg-white p-6 rounded-3xl border-2 border-emerald-100 shadow-sm min-h-[400px]">
                 <p className="text-[10px] font-bold text-slate-300 uppercase mb-4">{new Date(current.date).toLocaleString()}</p>
                 <h5 className="text-lg font-bold text-slate-800 mb-3">{current.title}</h5>
                 <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{current.content}</p>
                 <div className="mt-6 flex flex-wrap gap-2">
                    {current.tags.map((tag, i) => <span key={i} className="text-[9px] bg-slate-50 text-slate-400 px-2 py-1 rounded-lg">#{tag}</span>)}
                 </div>
              </div>
            </div>

            {/* History Versions */}
            {history.slice().reverse().map((version, index) => (
              <div key={index} className="w-80 md:w-96 flex-shrink-0">
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-3 w-3 bg-slate-300 rounded-full"></span>
                  <h4 className="text-sm font-black text-slate-500 uppercase tracking-tighter">Version {history.length - index}</h4>
                </div>
                <div className="bg-white/60 p-6 rounded-3xl border border-slate-200 min-h-[400px] opacity-80 hover:opacity-100 transition-opacity">
                   <p className="text-[10px] font-bold text-slate-300 uppercase mb-4">{new Date(version.updatedAt).toLocaleString()}</p>
                   <h5 className="text-lg font-bold text-slate-600 mb-3">{version.title}</h5>
                   <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-wrap">{version.content}</p>
                   <div className="mt-6 flex flex-wrap gap-2">
                      {version.tags.map((tag, i) => <span key={i} className="text-[9px] bg-slate-50 text-slate-300 px-2 py-1 rounded-lg">#{tag}</span>)}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 bg-white border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 font-medium italic">"We are not the same person we were a second ago." - Reflection of change.</p>
        </div>
      </div>
    </div>
  );
};

export default VersionComparison;