const initialPropertiesData = [];

export const getProperties = () => {
  if (typeof window === "undefined") {
    return initialPropertiesData;
  }
  
  const saved = localStorage.getItem("propertiesData");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse stored properties", e);
      return [];
    }
  }
  
  return [];
};

export const addProperty = (newProperty) => {
  if (typeof window === "undefined") return;
  const currentProperties = getProperties();
  
  const propertyWithParams = {
    ...newProperty,
    id: Date.now(),
    isNew: true,
  };
  
  const updatedProperties = [propertyWithParams, ...currentProperties];
  localStorage.setItem("propertiesData", JSON.stringify(updatedProperties));
  return updatedProperties;
};
