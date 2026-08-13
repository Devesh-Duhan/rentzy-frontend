import PropertyDetailClient from "./PropertyDetailClient";
import axiosInstance from "@/lib/axios";

// Fetch data on the server for SSR
async function getPropertyData(id) {
  try {
    const { data } = await axiosInstance.get(`/properties/${id}`);
    return data;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const property = await getPropertyData(id);
  
  return {
    title: property ? `${property.title} | RentzyPro Elite` : 'Property Details | RentzyPro',
    description: property?.description || `View detailed information for property ID ${id} on RentzyPro.`,
    openGraph: {
       images: property?.images?.[0] ? [{ url: property.images[0] }] : [],
    }
  };
}

export default async function PropertyDetailPage({ params }) {
  const { id } = await params;
  const initialData = await getPropertyData(id);
  
  return <PropertyDetailClient id={id} initialData={initialData} />;
}
