"use client";

import { useState, useEffect } from "react";
import { History, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "@/lib/axios";
import PropertyCard from "./PropertyCard";

const RecentlyViewed = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      try {
        let ids = [];
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("recentlyViewed");
          ids = stored ? JSON.parse(stored) : [];
        }

        if (ids.length === 0) {
          setLoading(false);
          return;
        }

        const recentIds = ids.slice(0, 6);
        const promises = recentIds.map((id) =>
          axios.get(`/properties/${id}`).then((res) => res.data).catch(() => null)
        );

        const results = await Promise.all(promises);
        setProperties(results.filter(Boolean));
      } catch {
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyViewed();
  }, []);

  const scrollContainer = (direction) => {
    const container = document.getElementById("recently-viewed-scroll");
    if (!container) return;
    const scrollAmount = 320;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (loading || properties.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
              <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recently Viewed</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scrollContainer("left")}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollContainer("right")}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          id="recently-viewed-scroll"
          className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 snap-x snap-mandatory"
        >
          {properties.map((property) => (
            <div key={property._id} className="min-w-[280px] md:min-w-[320px] snap-start flex-shrink-0">
              <PropertyCard
                {...property}
                id={property._id}
                title={property.title}
                location={property.location}
                price={property.price}
                images={property.images}
                image={property.image}
                type={property.type}
                purpose={property.purpose}
                isNew={property.isNew}
                area={property.areaSqFt || property.area}
                bhk={property.bedrooms || property.bhk}
                bathrooms={property.bathrooms}
                furnishing={property.furnishing}
                pricePerSqft={property.pricePerSqft}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
