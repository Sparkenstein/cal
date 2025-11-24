'use client';

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/login' })} 
      className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
    >
      <LogOut size={16} />
      <span>Sign Out</span>
    </button>
  );
}

