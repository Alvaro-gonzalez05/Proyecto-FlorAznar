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
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&amp;display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet" />
        <script id="tailwind-config" dangerouslySetInnerHTML={{
          __html: `
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  "off-white": "#fcfaf8",
                  "mint": "#e6f4f1",
                  "lavender": "#f0eafc",
                  "peach": "#fff1e6",
                  "black-accent": "#1a1a1a",
                },
                fontFamily: {
                  "display": ["Manrope", "sans-serif"]
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
