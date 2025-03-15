"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";

export default function PostRide() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [time, setTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

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
      const response = await fetch(`http://127.0.0.1:8000/auth/user/details?email=${email}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }
      const data = await response.json();
      setUserDetails(data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  // Prevent rendering if authentication status is loading
  if (status === "loading") {
    return <p className="text-center text-lg">Loading...</p>;
  }

  // Prevent rendering if not authenticated
  if (!session) {
    return null;
  }

  // Generate 30-minute time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 30) {
        slots.push(`${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`);
      }
    }
    return slots;
  };

  // Handle Ride Posting
  const postRide = async () => {
    if (!from || !to || !time) {
      alert("Please fill all fields.");
      return;
    }

    setIsLoading(true);

    try {
      const formattedTime = new Date();
      const [hours, minutes] = time.split(":");
      formattedTime.setHours(hours);
      formattedTime.setMinutes(minutes);

      const res = await fetch("http://localhost:8000/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          driver_id: userDetails.id,
          from_location: from,
          to_location: to,
          departure_time: formattedTime.toISOString(),
          driver_email: session?.user?.email, // Associate ride with logged-in user
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to post ride.");
      }

      alert("Ride posted successfully!");
      router.push("/dashboard"); // Redirect to Dashboard
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">Post a Ride</h1>

          <div className="grid gap-4">
            {/* Input Fields */}
            <input
              type="text"
              placeholder="From"
              className="w-full p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 text-lg"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="To"
              className="w-full p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 text-lg"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            />

            {/* Time Dropdown */}
            <select
              className="w-full p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 text-lg"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            >
              <option value="">Select Time</option>
              {generateTimeSlots().map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          {/* Post Ride Button */}
          <button
            onClick={postRide}
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold py-4 rounded-lg transition-all mt-6"
          >
            {isLoading ? "Posting..." : "Post Ride"}
          </button>
        </div>
      </main>
    </div>
  );
}
