import { Manrope } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import ChromeGate from "./components/Layout/ChromeGate";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "Karmic Vision — Streetwear for the modern warrior",
  description:
    "Premium hoodies, tees, and accessories. Discover the exclusive Karmic Vision collection.",
  metadataBase: new URL("http://localhost:3000"),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-black">
      <body
        className={`${manrope.variable} font-sans antialiased bg-black text-white min-h-screen`}
      >
        <Providers>
          <ChromeGate />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
