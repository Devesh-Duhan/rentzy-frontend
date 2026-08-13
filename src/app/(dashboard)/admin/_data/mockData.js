import {
  Users,
  Building2,
  Clock,
  BarChart3
} from "lucide-react";

export const STATS = [
  { label: "Total Users", value: "1,245", trend: "+12%", up: true, icon: Users, color: "indigo" },
  { label: "Total Properties", value: "567", trend: "+5%", up: true, icon: Building2, color: "emerald" },
  { label: "Active Rentals", value: "89", trend: "-2%", up: false, icon: Clock, color: "amber" },
  { label: "Revenue", value: "₹2.4L", trend: "+18%", up: true, icon: BarChart3, color: "rose" },
];

export const INITIAL_PROPERTIES = [];
export const INITIAL_USERS = [];
export const INITIAL_REVIEWS = [];

export const INITIAL_SITE_SETTINGS = {
  title: "rentzypro",
  description: "Premium Property Rental Platform",
  email: "contact@rentzypro.com",
  phone: "+919996002136",
  address: "123, Luxury Lane, Hisar, India",
  socials: { facebook: "facebook.com/rentzypro", twitter: "twitter.com/rentzypro", instagram: "instagram.com/rentzypro" }
};
