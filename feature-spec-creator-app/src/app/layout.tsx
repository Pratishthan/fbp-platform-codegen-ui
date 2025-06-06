import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "@/components/Header";
import StepProgress from "@/components/StepProgress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Service Specification Creator", // Updated title
  description: "Application for creating OpenAPI and Entity specifications", // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Dark mode toggle logic
  const toggleDarkMode = () => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark');
    }
  };

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased dark bg-gray-900 text-gray-100`}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <StepProgress />
          <main className="flex-grow container mx-auto p-4 md:p-6">
            {children}
          </main>
          <footer className="bg-gray-100 dark:bg-gray-800 text-center text-sm p-4 mt-auto text-gray-700 dark:text-gray-300">
            © {new Date().getFullYear()}
          </footer>
        </div>
        <ToastContainer />
      </body>
    </html>
  );
}
