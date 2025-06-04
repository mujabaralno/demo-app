"use client";
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SideBarLinks } from "@/constants";
const MobileNav = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="md:flex lg:hidden flex">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger className="flex justify-center items-center">
          <Image
            src="/menu.svg"
            alt="menu"
            width={24}
            height={24}
            className="cursor-pointer"
          />
        </SheetTrigger>
        <SheetContent className="flex-col gap-6 bg-white md:flex lg:hidden flex px-8 border-none">
          <SheetHeader>
            <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
          </SheetHeader>
          <Image src="/next.svg" alt="logo" width={128} height={38} />

          <div className="mt-10 flex flex-col gap-2">
            {SideBarLinks.map((link) => {
              const isActive = pathname === link.route;

              return (
                <Link className="" href={link.route} key={link.text}>
                  <div
                    className={cn(
                      "flex gap-4 items-center p-4 rounded-lg text-gray-500 justify-start",
                      isActive && "bg-[#25388C] shadow-sm"
                    )}
                  >
                    <p className={cn(isActive ? "text-white" : "text-dark")}>
                      {link.text}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default MobileNav;
