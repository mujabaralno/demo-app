"use client";
import Image from "next/image";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SideBarLinks } from "@/constants";

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 left-0 w-[15rem] bg-white shadow-lg p-3 min-h-screen hidden md:flex">
      <div className="flex flex-col w-full">
        <div className="p-4">
          <Image src="/next.svg" alt="logo" width={100} height={100} />
        </div>

        <div className="mt-10 flex flex-col gap-2">
          {SideBarLinks.map((link) => {
            const isActive = pathname === link.route;

            return (
              <Link className={cn(isActive ? "text-white" : "text-dark")} href={link.route} key={link.text}>
                <div
                  className={cn(
                    "flex gap-4 items-center p-4 rounded-lg justify-start",
                    isActive && "bg-[#25388C] shadow-sm"
                  )}
                >
                  <div className="relative size-5">
                    <Image
                      src={link.img}
                      alt="icon"
                      fill
                      className={`${
                        isActive
                          ? "brightness-10 invert"
                          : "brightness-300 invert"
                      }  object-contain`}
                    />
                  </div>

                  {link.text}
                </div>
              </Link>
            )}
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;