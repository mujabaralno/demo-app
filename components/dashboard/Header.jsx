"use client";

import { redirect } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import MobileNav from "@/components/dashboard/MobileNav";
import { fetchLastLoginCity } from "@/lib/LoginLog";

import HeadNav from "@/components/dashboard/shared/HeadNav";
import Image from "next/image";

const Header = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastLoginCity, setLastLoginCity] = useState(null);

  const nextQuoteNumberRef = useRef(1);

  // Notification state
  const [notification, setNotification] = useState(null);

  // Show notification function
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadLastLoginCity = async (userId) => {
    const city = await fetchLastLoginCity(userId);
    if (city) {
      setLastLoginCity(city);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      redirect("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      if (parsedUser.id) {
        loadLastLoginCity(parsedUser.id);
      }
      showNotification(
        `Welcome back, ${parsedUser.full_name || parsedUser.employee_id}!`
      );
    } catch (error) {
      console.error("Error parsing user data:", error);
      redirect("/login");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    showNotification("Logged out successfully");
    redirect("/login");
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === "error"
              ? "bg-red-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}

      <header className="w-full bg-white">
        <div className="flex justify-between items-center wrapper ">
          <div className="lg:flex md:hidden hidden">
            <HeadNav
              currentQuoteNumber={`PE-${String(
                nextQuoteNumberRef.current - 1
              ).padStart(3, "0")}`}
              currentEmployee="System Admin"
              location={lastLoginCity}
            />
          </div>

          <div className="flex lg:justify-end md:justify-between lg:p-0 md:p-2 p-4 justify-between items-center lg:max-w-xs max-w-6xl w-full gap-4">
            <Image
              src="/next.svg"
              alt="logo"
              width={100}
              height={20}
              className="md:flex lg:hidden flex"
            />
            <div className="gap-3 flex items-center md:flex w-32 justify-end">
              <button
                onClick={handleLogout}
                className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200"
              >
                Logout
              </button>
              <div className="md:flex lg:hidden flex">
                <MobileNav />
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
