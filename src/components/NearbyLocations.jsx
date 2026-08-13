"use client";

const NearbyLocations = ({ onAreaClick, activeArea, districtName, dynamicCities }) => {
  // Use dynamicCities passed from HomeClient, or fallback if necessary (shouldn't be)
  const displayAreas = dynamicCities || [];

  return (
    <section className="py-24 bg-white dark:bg-slate-900 overflow-hidden transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
            Explore Nearby Locations in {districtName?.split(',')[0] || "Hisar"}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Click on an area on the map to find all available rental properties in {districtName || "Hisar, Haryana"}.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Map Container */}
          <div className="flex-1 w-full relative h-[400px] sm:h-[550px] group">
            <div className="bg-white dark:bg-slate-800 rounded-[32px] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-900 h-full transition-all duration-500 group-hover:shadow-indigo-500/10">
              <iframe
                key={activeArea || districtName}
                width="100%"
                height="100%"
                style={{ border: 0, filter: "grayscale(0.2) contrast(1.1) invert(var(--tw-invert))" }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodeURIComponent((activeArea ? activeArea + ", " + districtName : districtName || "Hisar, Haryana"))}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full dark:invert-[0.9] dark:hue-rotate-[180deg]"
              ></iframe>
            </div>

            {/* Map Legend/Overlay */}
            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md dark:bg-slate-900/90 px-5 py-4 rounded-2xl shadow-2xl border border-white/50 dark:border-slate-800/50 text-xs hidden sm:block">
              <div className="flex items-center gap-3 mb-2 font-bold text-slate-900 dark:text-slate-100">
                <i className="fas fa-map-marked-alt text-indigo-600 dark:text-indigo-300"></i> Region: {activeArea || "All Districts"}
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm animate-pulse"></span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">Live Properties Available</span>
              </div>
            </div>
          </div>

          {/* Area List Column */}
          <div className="flex-1 w-full space-y-4 relative z-20">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-8 flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                <i className="fas fa-list-ul text-sm"></i>
              </div>
              Local Areas in {districtName?.split(',')[0]}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayAreas.map((area) => (
                <button
                  key={area.id}
                  onClick={() => onAreaClick(area.name)}
                  className={`flex flex-col p-5 rounded-2xl border transition-all duration-300 transform active:scale-95 ${activeArea === area.name
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200 dark:bg-indigo-700 dark:border-indigo-700 dark:text-white"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-200 dark:hover:border-indigo-500/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg"
                    }`}
                >
                  <span className="font-bold text-sm sm:text-base mb-1">{area.name}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${activeArea === area.name ? "text-indigo-100 dark:text-indigo-200" : "text-slate-400 dark:text-slate-400"}`}>
                    {area.count} properties
                  </span>
                </button>
              ))}
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-700/30 mt-10">
              <p className="text-sm text-indigo-800 dark:text-indigo-200 font-bold italic leading-relaxed">
                "Direct from owner properties verified by our local experts in every sector of {districtName?.split(',')[0]}."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NearbyLocations;
