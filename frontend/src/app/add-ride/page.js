"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddRide({ closeAddRide }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [time, setTime] = useState("");
  const [seats, setSeats] = useState(1);
  const [isCardVisible, setIsCardVisible] = useState(true);
  const { data: session, status } = useSession();
  const [userDetails, setUserDetails] = useState(null);
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserDetails(session.user.email);
    }
  }, [session]); // Fetch user details only when session is available

  const fetchUserDetails = async (email) => {
    try {
      const response = await fetch(`https://carpool-cloud-backend.onrender.com/auth/user/details?email=${email}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }
      const data = await response.json();
      setUserDetails(data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  if (status === "loading") {
    return <p className="text-center text-lg">Loading...</p>;
  }

  if (!session) {
    return null; // Prevent rendering if not authenticated
  }

  const handleAddRide = async (e) => {
    e.preventDefault();

    try {
      const formattedTime = new Date(time); // Convert input to valid datetime

      const res = await fetch("http://localhost:8000/rides/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          driver_id: userDetails.id,
          from_location: from,
          to_location: to,
          time: formattedTime.toISOString(), // Matches FastAPI model
          seatsAvailable: seats, // Matches camelCase requirement
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to add ride");
      }

      alert("Ride added successfully!");
      router.push("/dashboard");
    } catch (error) {
      alert("Error adding ride: " + error.message);
    }
  };

  const closeCard = () => {
    setIsCardVisible(false);
    closeAddRide();
  };

  return (
    <>
      {isCardVisible && (
        <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg relative">
          <button
            onClick={closeCard}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>

          <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">Offer a Ride</h1>

          <form onSubmit={handleAddRide} className="space-y-5">
            {/* From Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700">From</label>
              <input
                type="text"
                placeholder="Enter departure location"
                className="w-full p-3 mt-1 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                required
              />
            </div>

            {/* To Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700">To</label>
              <input
                type="text"
                placeholder="Enter destination"
                className="w-full p-3 mt-1 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
              />
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Time</label>
              <input
                type="datetime-local"
                className="w-full p-3 mt-1 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>

            {/* Seats Available */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Seats Available</label>
              <input
                type="number"
                min="1"
                className="w-full p-3 mt-1 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={seats}
                onChange={(e) => setSeats(parseInt(e.target.value))}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold py-3 rounded-lg transition-all"
            >
              Post Ride
            </button>
          </form>
        </div>
      )}
    </>
  );
}
