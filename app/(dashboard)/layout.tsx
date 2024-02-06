import type { Metadata } from "next";
import Sidebar from "./_components/sidebar";
import OrgSidebar from "./_components/org-sidebar";
import Navbar from "./_components/navbar";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Start here",
};

interface DashBoardLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: DashBoardLayoutProps) {
  return (
    <main className="h-full ">
      <Sidebar />
      <div className="h-full pl-[60px]">
        <div className="flex h-full gap-x-3">
          <OrgSidebar />
          <div className="h-full flex-1">
            <Navbar />
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
