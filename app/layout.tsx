import type { Metadata } from "next";
import { Raleway, Lora } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import AuthProvider from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ChatWidget from "@/components/ChatWidget";


const raleway = Raleway({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
});
const lora = Lora({
  weight: ["400", "500", "600", "700"],
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
      <body className={`${raleway.className} ${raleway.variable} ${lora.variable}`} suppressHydrationWarning>
        <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <div className="app-wrapper">
              <Navbar />
              <main className="main-content">
                {children}
              </main>
              <Footer />
              <CartDrawer />
              <ChatWidget />
            </div>
          </CartProvider>
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
