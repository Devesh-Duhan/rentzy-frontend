import { LOGO_SRC } from '@/lib/constants';

export default function manifest() {
  return {
    name: "rentzypro - Find Your Perfect Property",
    short_name: "rentzypro",
    description: "Find Rental Properties Direct From Owners - No Brokerage",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4f46e5",
    icons: [
      { src: LOGO_SRC, sizes: "192x192", type: "image/png", purpose: "any" },
    ],
  };
}
