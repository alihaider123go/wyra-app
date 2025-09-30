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
  title: "Wyra - Would You Rather",
  description: "Life's full of choices – make them fun! ✨",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Run before React hydration, sets theme instantly */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem("theme");
                  if (theme === "dark") {
                    document.documentElement.classList.add("dark");
                  } else {
                    document.documentElement.classList.remove("dark");
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <div
          className="min-h-screen flex flex-col relative overflow-hidden 
            bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100
            dark:from-gray-900 dark:via-gray-900 dark:to-gray-900"
          suppressHydrationWarning
        >
          <div className="flex-grow">{children}</div>
        </div>
      </body>
    </html>
  );
}
