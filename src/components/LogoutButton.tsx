"use client";

import { logout } from "../lib/server/logout";

export default function LogoutButton() {
  const handleLogout = async () => {
    await logout();
  };

  return (
    <button 
      onClick={handleLogout}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      Logout
    </button>
  );
}
