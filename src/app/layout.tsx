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
  title: "Numerología | Descubre tu Camino",
  description: "Descubre el significado oculto de tus números y transforma tu vida.",
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
                },
                fontFamily: {
                  "display": ["Manrope", "sans-serif"],
                  "serif": ["Playfair Display", "serif"]
                },
                borderRadius: {
                  "xl": "1rem",
                  "2xl": "1.5rem",
                  "3xl": "2rem"
                }
              },
            },
          }
        `}} />
      </head>
      <body className="min-h-screen font-display bg-off-white text-black-accent">
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </body>
    </html>
  );
}
