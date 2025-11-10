import "./globals.css";
import { ReactNode } from "react";
import {Sidebar} from "@/components/Sidebar";
import {Header} from "@/components/Header";

export const metadata = {
  title: "Flowbit Dashboard",
  description: "Dashboard demo",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen text-slate-900">
          <div className="flex">
            <aside className="w-56 sticky top-0 h-screen">
              <Sidebar />
            </aside>

            <div className="flex-1">
              <header className="sticky top-0 z-20">
                <Header />
              </header>

              <main className="p-6">{children}</main>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
