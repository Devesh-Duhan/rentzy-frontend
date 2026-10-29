import "./globals.css";
import "./market.css";
import "./dropdowns.css";
import { buildMetadata } from "@/seo";
import StoreProvider from "@/store/StoreProvider";
import { Toaster } from "react-hot-toast";
import ThemeProvider from "@/components/ThemeProvider";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import Navbar from "@/components/Navbar";
import OrganizationSchema from "@/components/OrganizationSchema";
import PWAProvider from "@/components/PWAProvider";
import { BRAND_ASSETS, BRAND_ICONS, WEB_APP_BRAND } from "@/lib/brand";

export const viewport = { themeColor: WEB_APP_BRAND.theme_color };

export async function generateMetadata() {
  return {
    ...buildMetadata(),
    manifest: BRAND_ASSETS.manifest,
    icons: BRAND_ICONS,
    other: {
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
      'msapplication-TileColor': WEB_APP_BRAND.theme_color,
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <StoreProvider>
          <ReactQueryProvider>
            <ThemeProvider>
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
