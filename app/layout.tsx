// app/layout.tsx
import "./globals.css";
import Providers from "./providers";
import { Plus_Jakarta_Sans } from "next/font/google";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { SignOutButton } from "./components/SignOutButton";
import Link from "next/link";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Activity Tracker",
  description: "Track your daily activities simply.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body
        className={`${fontSans.variable} font-sans antialiased bg-gray-50/50`}
      >
        <Providers>
          <div className="min-h-screen flex flex-col">
            {session?.user && (
              <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
                  <Link
                    href="/"
                    className="font-bold text-lg tracking-tight text-gray-900 hover:opacity-80 transition-opacity"
                  >
                    LifeTracker
                  </Link>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:block text-sm text-gray-500">
                      {session.user.name || session.user.email}
                    </div>
                    <SignOutButton />
                  </div>
                </div>
              </header>
            )}
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
