"use client";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  if (!session) return null;

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleViewProfile = () => {
    router.push("/profile");
    setShowProfileDropdown(false);
  };

  const handleEditProfile = () => {
    router.push("/profile/edit");
    setShowProfileDropdown(false);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  const handleRequests = () => {
    router.push("/your-requests");
  };
  const handleImageClick = () => {
    router.push("/dashboard");
  };
  const handleYourRequests = () => {
    router.push("/your-requests");
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-[#ffc727] cursor-pointer" onClick={handleImageClick}>
        HopIn.
      </h1>

      <div className="flex items-center space-x-4">
        {/* Requests Icon */}
        <div 
          className="relative cursor-pointer"
          onClick={handleRequests}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 hover:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" onClick={handleYourRequests}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        
        {/* Profile Icon with Dropdown */}
        <div className="relative">
          <div 
            className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer"
            onClick={toggleProfileDropdown}
          >
            {session?.user?.image ? (
              <image 
                src={session.user.image} 
                alt="Profile" 
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          
          {/* Dropdown Menu */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <button
                onClick={handleViewProfile}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                View Profile
              </button>
              <button
                onClick={handleEditProfile}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Edit Profile
              </button>
              <div className="border-t border-gray-100"></div>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}