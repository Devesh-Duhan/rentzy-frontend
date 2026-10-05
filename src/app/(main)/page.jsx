import HomeClient from "./HomeClient";

export const metadata = {
  title: "rentzypro | India's #1 Middlemen-Free Property Rental Platform",
  description: "Find your dream home, apartment, or commercial space without paying any brokerage. Direct connection between owners and tenants.",
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home() {
  return <HomeClient />;
}
