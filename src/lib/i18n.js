const translations = {
  en: {
    nav: {
      home: "Home",
      properties: "Properties",
      about: "About",
      contact: "Contact",
      login: "Login",
      register: "Register",
      profile: "Profile",
      logout: "Logout",
    },
    home: {
      heroTitle: "Find Your Dream Property",
      heroSubtitle: "Browse thousands of properties directly from owners",
      searchPlaceholder: "Search for category (e.g. PG, Flats, Land...)",
      featured: "Featured Properties",
      categories: "Browse by Category",
    },
    property: {
      monthlyRent: "Monthly Rent",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      area: "Area (sqft)",
      amenities: "Amenities",
      description: "Description",
      contactOwner: "Contact Owner",
      scheduleVisit: "Schedule Visit",
      share: "Share",
      report: "Report",
    },
    common: {
      loading: "Loading...",
      error: "Something went wrong",
      noResults: "No results found",
      viewAll: "View All",
      save: "Save",
      remove: "Remove",
      edit: "Edit",
      delete: "Delete",
      cancel: "Cancel",
      confirm: "Confirm",
    },
  },
  hi: {
    nav: {
      home: "होम",
      properties: "प्रॉपर्टी",
      about: "हमारे बारे में",
      contact: "संपर्क",
      login: "लॉगिन",
      register: "रजिस्टर",
      profile: "प्रोफाइल",
      logout: "लॉगआउट",
    },
    home: {
      heroTitle: "अपनी ड्रीम प्रॉपर्टी खोजें",
      heroSubtitle: "मालिकों से सीधे हजारों प्रॉपर्टी देखें",
      searchPlaceholder: "श्रेणी खोजें (जैसे PG, फ्लैट, जमीन...)",
      featured: "फीचर्ड प्रॉपर्टी",
      categories: "श्रेणी के अनुसार देखें",
    },
    property: {
      monthlyRent: "मासिक किराया",
      bedrooms: "बेडरूम",
      bathrooms: "बाथरूम",
      area: "एरिया (sqft)",
      amenities: "सुविधाएं",
      description: "विवरण",
      contactOwner: "मालिक से संपर्क करें",
      scheduleVisit: "विजिट शेड्यूल करें",
      share: "शेयर करें",
      report: "रिपोर्ट करें",
    },
    common: {
      loading: "लोड हो रहा है...",
      error: "कुछ गलत हो गया",
      noResults: "कोई परिणाम नहीं मिला",
      viewAll: "सभी देखें",
      save: "सेव करें",
      remove: "हटाएं",
      edit: "एडिट",
      delete: "डिलीट",
      cancel: "रद्द करें",
      confirm: "पुष्टि करें",
    },
  },
};

let currentLang = 'en';
const listeners = [];

export function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
    if (typeof window !== 'undefined') {
      localStorage.setItem('rentzy_lang', lang);
    }
    listeners.forEach(fn => fn(lang));
  }
}

export function getLanguage() {
  return currentLang;
}

export function t(path) {
  const keys = path.split('.');
  let val = translations[currentLang];
  for (const key of keys) {
    val = val?.[key];
  }
  return val || path;
}

export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

// Initialize from localStorage
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('rentzy_lang');
  if (saved && translations[saved]) {
    currentLang = saved;
  }
}

export default translations;
