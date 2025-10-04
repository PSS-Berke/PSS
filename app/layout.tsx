import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Provider } from "./provider";
import { AuthProvider } from "@/lib/xano/auth-context";
import PermanentSidebar from '@/components/permanent-sidebar';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Multi-tenant App",
  description: "A Multi-tenant Next.js Starter Template with Xano",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Provider>
          <AuthProvider>
            <div className="w-full flex">
              <PermanentSidebar />

              <div className="flex flex-col flex-grow w-0 ml-[260px]">
                {children}
              </div>
            </div>
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}
