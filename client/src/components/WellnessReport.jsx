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

  if (loading) return <div className="p-8 text-center text-secondary/40 italic">Generating your report...</div>;
  if (!report || report.message) return <div className="p-8 text-center text-secondary/40 italic">{report?.message || "No data available."}</div>;

  return (
    <div className="bg-gradient-to-br from-sage to-sage-dark rounded-3xl p-8 text-white shadow-soft mb-10 fade-in">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-3xl font-serif font-bold mb-1">Wellness Summary</h3>
          <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em]">{report.period}</p>
        </div>
        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
          <span className="text-2xl">🌿</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/10">
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-2">Average Mood</p>
          <p className="text-4xl font-serif font-bold">{report.averageMood}</p>
          <p className="text-[10px] text-white/50 mt-3 italic">Balanced and mindful.</p>
        </div>
        <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/10">
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-2">Consistency</p>
          <p className="text-4xl font-serif font-bold">{report.journalingFrequency}</p>
          <p className="text-[10px] text-white/50 mt-3 italic">Reflections this period.</p>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center">
        <p className="text-sm text-white/80 font-serif italic">"Mindfulness is the key to clarity."</p>
        <div className="text-right">
            <p className="text-[9px] font-bold uppercase text-white/40 tracking-wider">Lifetime Reflections</p>
            <p className="text-lg font-serif font-bold">{report.totalEntries}</p>
        </div>
      </div>
    </div>
  );
};

export default WellnessReport;
