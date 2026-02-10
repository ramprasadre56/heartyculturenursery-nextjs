import type { Metadata } from "next";
import { Montserrat, Cormorant } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import AuthProvider from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";


const montserrat = Montserrat({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
});
const cormorant = Cormorant({
  weight: ["300", "400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Govinda's Horticulture Nursery - From Our Nursery to Your Place",
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
      <body className={`${montserrat.className} ${montserrat.variable} ${cormorant.variable}`} suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <div className="app-wrapper">
              <Navbar />
              <main className="main-content">
                {children}
              </main>

              <CartDrawer />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
