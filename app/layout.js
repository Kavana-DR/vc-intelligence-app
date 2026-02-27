import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "VC Discovery App",
  description: "Discover and track venture-backed companies",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900`}
      >
        <div className="min-h-screen lg:flex">
          <Sidebar />
          <main className="flex-1">
            <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 px-6 py-3 backdrop-blur">
              <Link href="/companies" className="text-sm font-semibold tracking-wide text-slate-700">
                VC Discovery
              </Link>
            </header>
            <div className="p-4 sm:p-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
