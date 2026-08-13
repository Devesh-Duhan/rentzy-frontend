import AlertsClient from "./AlertsClient";

export const metadata = {
  title: "Property Alerts - rentzypro",
  description: "Manage your saved search alerts and get notified when new properties match your criteria.",
};

export default function AlertsPage() {
  return <AlertsClient />;
}
