"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PropertyCard from "@/components/PropertyCard";
import { getProperties } from "@/utils/propertyStore";

export default function FeaturedPropertiesPage() {
  const searchParams = useSearchParams();
  const district = searchParams.get("district");
  const area = searchParams.get("area");
  
  const [properties, setProperties] = useState([]);
  
  useEffect(() => {
    setProperties(getProperties());
  }, []);

  const filteredProps = area 
    ? properties.filter(p => p.location.includes(area))
    : properties;

  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-slate-900">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Featured Properties</h1>
      {district && area ? (
        <>
          <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden md:max-w-2xl mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Selected Location</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">District: {district}</p>
              <p className="text-gray-600 dark:text-gray-300">Area: {area}</p>
            </div>
          </div>
          {/* Actual property cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProps.length > 0 ? (
              filteredProps.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  id={prop.id}
                  title={prop.title}
                  location={typeof prop.location === "object" ? (prop.location?.address || prop.location?.city || "") : prop.location}
                  price={prop.price}
                  image={prop.image || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"}
                  type={prop.type}
                  purpose={prop.purpose}
                  isNew={prop.isNew}
                />
              ))
            ) : (
              <p className="text-gray-500 italic col-span-full">No properties found in this location yet.</p>
            )}
          </div>
        </>
      ) : (
        <p className="text-gray-600 dark:text-gray-300">No location selected.</p>
      )}
    </main>
  );
}

