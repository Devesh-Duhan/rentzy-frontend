import ReraClient from "./ReraClient";

export const metadata = {
  title: "RERA Registered Properties - rentzypro",
  description: "Browse RERA registered properties. Real Estate Regulatory Authority compliant listings for buyer protection.",
};

export default function ReraPage() {
  return <ReraClient />;
}
