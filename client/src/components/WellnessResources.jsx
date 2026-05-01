import React from 'react';

const WellnessResources = () => {
  const resources = [
    {
      title: "Guided Meditations",
      description: "Free guided meditation sessions for all levels.",
      url: "https://www.insighttimer.com",
      category: "Meditation"
    },
    {
      title: "Mindfulness Basics",
      description: "Learn the fundamentals of mindfulness from Mindful.org.",
      url: "https://www.mindful.org/meditation/mindfulness-getting-started/",
      category: "Education"
    },
    {
      title: "Sleep Hygiene Tips",
      description: "Better sleep for better mental health.",
      url: "https://www.sleepfoundation.org/sleep-hygiene",
      category: "Sleep"
    },
    {
      title: "Daily Breathing Exercises",
      description: "Simple techniques to reduce stress and anxiety.",
      url: "https://www.verywellmind.com/abdominal-breathing-2584115",
      category: "Breathing"
    },
    {
      title: "TED Talk: The Power of Vulnerability",
      description: "Brené Brown's famous talk on human connection.",
      url: "https://www.ted.com/talks/brene_brown_the_power_of_vulnerability",
      category: "Inspiration"
    },
    {
      title: "Anxiety Relief Tools",
      description: "Practical tools for managing anxiety in daily life.",
      url: "https://www.adaa.org/tips-manage-anxiety-and-stress",
      category: "Mental Health"
    }
  ];

  return (
    <div className="max-w-4xl w-full mx-auto p-6">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-black text-indigo-950 mb-2">Wellness Resources</h2>
        <p className="text-slate-500">Curated tools and articles to support your mental wellness journey.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map((resource, index) => (
          <a
            key={index}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-1 rounded">
                {resource.category}
              </span>
              <span className="text-slate-200 group-hover:text-indigo-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{resource.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{resource.description}</p>
          </a>
        ))}
      </div>

      <div className="mt-12 p-8 bg-indigo-600 rounded-[2rem] text-white text-center">
        <h4 className="text-xl font-bold mb-2">Need Immediate Support?</h4>
        <p className="text-indigo-100 text-sm mb-6">If you're in crisis, please reach out to professional help immediately.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="tel:988" className="bg-white text-indigo-600 px-6 py-2 rounded-full font-bold text-sm">Crisis Lifeline: 988 (USA)</a>
          <a href="https://www.befrienders.org/" target="_blank" rel="noopener noreferrer" className="bg-indigo-500 text-white border border-indigo-400 px-6 py-2 rounded-full font-bold text-sm hover:bg-indigo-400 transition-all">Global Resources</a>
        </div>
      </div>
    </div>
  );
};

export default WellnessResources;