import HomeClient from "./HomeClient";

export const metadata = {
  title: "rentzypro | India's #1 Middlemen-Free Property Rental Platform",
  description: "Find your dream home, apartment, or commercial space without paying any brokerage. Direct connection between owners and tenants.",
};

export const revalidate = 60; // Revalidate every minute

export default function Home() {
  return <HomeClient />;
}
