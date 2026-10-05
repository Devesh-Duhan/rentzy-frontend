import "./globals.css";
import StoreProvider from "@/store/StoreProvider";
import { Toaster } from "react-hot-toast";
import ThemeProvider from "@/components/ThemeProvider";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import Navbar from "@/components/Navbar";
import KeepAlive from "@/components/KeepAlive";
import OrganizationSchema from "@/components/OrganizationSchema";
import PWAProvider from "@/components/PWAProvider";

export const metadata = {
  title: "rentzypro - Property Rental",
  description: "Find Rental Properties Direct From Owners",
  manifest: "/manifest.webmanifest",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "msapplication-TileColor": "#4f46e5",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
        <OrganizationSchema />
        <meta name="theme-color" content="#4f46e5" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <StoreProvider>
          <ReactQueryProvider>
            <ThemeProvider>
              <KeepAlive />
              <Navbar />
              <Toaster position="top-center" />
              <PWAProvider>
                {children}
              </PWAProvider>
            </ThemeProvider>
          </ReactQueryProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
