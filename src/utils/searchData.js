export const SEARCH_DATA = [
  { title: "Home", type: "Page", url: "/" },
  { title: "Featured Properties", type: "Page", url: "/featured-properties/1" },
  { title: "All Properties", type: "Page", url: "/properties/1" },
  { title: "Add Property", type: "Action", url: "/become-seller" },
  { title: "Seller Dashboard", type: "Dashboard", url: "/seller" },
  { title: "Admin Panel", type: "Dashboard", url: "/admin" },
  { title: "Login", type: "Auth", url: "/login" },
  { title: "Register Account", type: "Auth", url: "/register" },
  // Property Types
  { title: "Residential (Flats, Villas)", type: "Category", url: "/category/residential" },
  { title: "Commercial (Shops, Offices)", type: "Category", url: "/category/commercial" },
  { title: "Industrial (Warehouses, Factories)", type: "Category", url: "/category/industrial" },
  { title: "Land / Plots", type: "Category", url: "/category/land" },
  { title: "PG & Hostels", type: "Category", url: "/category/pg-hostel" },
  { title: "Short-term Rentals", type: "Category", url: "/category/short-term" },
  // Cities/Locations removed to keep search data real
];

export const getSearchResults = (query) => {
  if (!query || query.trim() === "") return [];
  const q = query.toLowerCase().trim();
  return SEARCH_DATA.filter((item) => 
    item.title.toLowerCase().includes(q) || 
    item.type.toLowerCase().includes(q)
  );
};
