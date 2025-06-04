import React, { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar"
import Header from "@/components/dashboard/Header"
import { Toaster } from "@/components/ui/sonner";

const Layout = async ({ children }: { children: ReactNode }) => {

  return (
    <main className="flex min-h-screen w-full flex-row">
      <div className="md:flex hiiden">
      <Sidebar />
      </div>
      <div className="w-full bg-[#F8F8FF]">
        <Header />
        {children}
        <Toaster className="bg-white"/>
      </div>
    </main>
  );
};
export default Layout;