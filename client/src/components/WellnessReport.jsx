import React, { useState, useEffect } from 'react';
import API from '../../api';

const WellnessReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await API.get('/analytics/report', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setReport(response.data);
      } catch (error) {
        console.error("Failed to fetch report", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400">Generating report...</div>;
  if (!report || report.message) return <div className="p-8 text-center text-slate-400">{report?.message || "No data available."}</div>;

  return (
    <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl mb-10">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-black mb-1">Wellness Report</h3>
          <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest">{report.period}</p>
        </div>
        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
          <span className="text-2xl">📊</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-sm">
          <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Average Mood</p>
          <p className="text-3xl font-black">{report.averageMood}</p>
          <p className="text-[10px] text-indigo-100 mt-2">Scale: 1 (Low) to 5 (High)</p>
        </div>
        <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-sm">
          <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Frequency</p>
          <p className="text-3xl font-black">{report.journalingFrequency}</p>
          <p className="text-[10px] text-indigo-100 mt-2">Entries this week</p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
        <p className="text-xs text-indigo-100 italic">"Consistency is the key to self-discovery."</p>
        <div className="text-right">
            <p className="text-[9px] font-black uppercase text-indigo-200">Total Reflections</p>
            <p className="text-sm font-bold">{report.totalEntries}</p>
        </div>
      </div>
    </div>
  );
};

export default WellnessReport;
