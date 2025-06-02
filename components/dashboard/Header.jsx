"use client";

import { redirect } from "next/navigation";
import { useState, useEffect } from "react";

const Header = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Notification state
  const [notification, setNotification] = useState(null);

  // Show notification function
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
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

  const goToAdmin = () => {
    window.location.href = "/admin";
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
        <div className="flex justify-between items-center wrapper">
          <div>
            <h1 className="h3-bold text-black">
              Welcome, {user.full_name || user.employee_id}
            </h1>
            <p className="p-14-medium text-gray-400">
              Monitor all of your projects and tasks here
            </p>
          </div>

          <div className="flex justify-end items-center max-w-xs w-full gap-4">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                user.role === "admin"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {user.role}
            </span>
            {user.role === "admin" && (
              <button
                onClick={goToAdmin}
                className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-md hover:bg-blue-200"
              >
                Admin Panel
              </button>
            )}
            <button
              onClick={handleLogout}
              className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
