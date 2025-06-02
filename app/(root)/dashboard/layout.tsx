import React, { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar"
import Header from "@/components/dashboard/Header"

const Layout = async ({ children }: { children: ReactNode }) => {

  return (
    <main className="flex min-h-screen w-full flex-row">
      <Sidebar />
      <div className="w-full">
        <Header />
        {children}
      </div>
    </main>
  );
};
export default Layout;