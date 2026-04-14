import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import DashboardLayout from "./components/DashboardLayout";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "METODO RAP | Flor Aznar",
  description: "Descubre el significado oculto de tus números y transforma tu vida.",
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&amp;family=Playfair+Display:ital,wght@0,400;0,700;1,400&amp;display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet" />
        <script id="tailwind-config" dangerouslySetInnerHTML={{
          __html: `
          tailwind.config = {
            darkMode: "class",
            theme: {
              extend: {
                colors: {
                  "off-white": "#fcfaf8",
                  "mint": "#f0f9f8",
                  "lavender": "#f5f3ff",
                  "peach": "#fff8f1",
                  "rose-mist": "#fff1f2",
                  "black-accent": "#1a1a1a",
                  "dark-gray": "#4a4a4a",
                  "whatsapp-green": "#e7f8f2",
                  "gmail-blue": "#e8f0fe",
                  "cream-soft": "#fdfbf7",
                  "surface-tint": "#1a1a1a",
                  "background": "#fcfaf8",
                  "tertiary-fixed": "#fff1e6",
                  "tertiary": "#fff1e6",
                  "on-secondary": "#581c87",
                  "surface-container": "#f0eafc",
                  "on-secondary-container": "#3b0764",
                  "secondary": "#f0eafc",
                  "secondary-fixed": "#f0eafc",
                  "inverse-primary": "#ffffff",
                  "on-error-container": "#991b1b",
                  "error": "#ef4444",
                  "inverse-surface": "#1a1a1a",
                  "on-tertiary-fixed": "#7c2d12",
                  "on-primary": "#ffffff",
                  "surface-container-lowest": "#ffffff",
                  "surface-container-highest": "#fff1e6",
                  "primary": "#1a1a1a",
                  "tertiary-container": "#ffedd5",
                  "surface-bright": "#ffffff",
                  "inverse-on-surface": "#fcfaf8",
                  "secondary-container": "#e9d5ff",
                  "primary-fixed": "#1a1a1a",
                  "primary-container": "#334155",
                  "on-surface-variant": "#64748b",
                  "surface-container-high": "#e6f4f1",
                  "primary-fixed-dim": "#334155",
                  "error-container": "#fee2e2",
                  "secondary-fixed-dim": "#e9d5ff",
                  "on-tertiary-fixed-variant": "#9a3412",
                  "surface-dim": "#f2eee9",
                  "on-primary-fixed-variant": "#cbd5e1",
                  "outline-variant": "#e2e8f0",
                  "on-surface": "#1a1a1a",
                  "on-primary-container": "#f1f5f9",
                  "outline": "#f1f5f9",
                  "surface": "#fcfaf8",
                  "surface-variant": "#ffffff",
                  "on-tertiary-container": "#7c2d12",
                  "on-error": "#ffffff",
                  "tertiary-fixed-dim": "#ffedd5",
                  "surface-container-low": "#fcfaf8",
                  "on-secondary-fixed-variant": "#581c87",
                  "on-secondary-fixed": "#3b0764",
                  "on-primary-fixed": "#ffffff",
                  "on-tertiary": "#9a3412",
                  "on-background": "#1a1a1a"
                },
                fontFamily: {
                  "display": ["Manrope", "sans-serif"],
                  "serif": ["Playfair Display", "serif"],
                  "headline": ["Manrope", "sans-serif"],
                  "body": ["Manrope", "sans-serif"],
                  "label": ["Manrope", "sans-serif"]
                },
                borderRadius: {
                  "xl": "1rem",
                  "2xl": "1.5rem",
                  "3xl": "2rem",
                  "full": "9999px"
                }
              },
            },
          }
        `}} />
      </head>
      <body className="min-h-screen w-full font-display bg-off-white text-black-accent">
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </body>
    </html>
  );
}
