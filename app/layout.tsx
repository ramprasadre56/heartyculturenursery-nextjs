import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Horticulture Nursery - From Our Nursery to Your Place",
  description: "Discover 400+ varieties of plants. Flowering shrubs, palms, fruit trees, heliconia, and more. Order via WhatsApp for delivery.",
  keywords: "nursery, plants, garden, flowering shrubs, palms, fruit trees, heliconia, plumeria, india",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <CartProvider>
          <div className="app-wrapper">
            <Navbar />
            <main className="main-content">
              {children}
            </main>
            <Footer />
            <CartDrawer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
