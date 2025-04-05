import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Feature Specification Creator", // Updated title
  description: "Application for creating OpenAPI and Entity specifications", // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}>
        <div className="flex flex-col min-h-screen">
          <header className="bg-white shadow-sm p-4">
            <nav className="container mx-auto">
              {/* Navigation placeholder */}
              <span className="font-semibold text-lg">Feature Spec Creator</span>
            </nav>
          </header>
          <main className="flex-grow container mx-auto p-4 md:p-6">
            {children}
          </main>
          <footer className="bg-gray-100 text-center text-sm p-4 mt-auto">
            {/* Footer placeholder */}
            © {new Date().getFullYear()}
          </footer>
        </div>
      </body>
    </html>
  );
}
