"use client";
import "../../styles/globals.css";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import RideCard from "../../components/RideCard";
import AddRide from "../add-ride/page.js";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [time, setTime] = useState("");
  const [rides, setRides] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddRide, setShowAddRide] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const router = useRouter();

  console.log("Session Data:", session);

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

  console.log("User Details:", userDetails);

  if (status === "loading") {
    return <p className="text-center text-lg">Loading...</p>;
  }

  if (!session) {
    return null;
  }

  const findRides = async () => {
    setIsLoading(true);
    if (!from || !to) {
      alert("Please fill all fields.");
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:8000/rides/find?from_location=${encodeURIComponent(from)}&to_location=${encodeURIComponent(to)}`,
        { method: "GET" }
      );
      if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      console.log("API Response:", data);
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received from API");
      }
      setRides(data);
    } catch (error) {
      console.error("Error fetching rides:", error);
      alert("Error fetching rides: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const requestRide = async (rideId) => {
    if (!session?.user?.email) {
      alert("User email not found.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/rides/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ride_id: rideId, user_email: session.user.email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to request ride");
      }

      alert("Ride request sent successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-gray-100 relative">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8 relative z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Find a Ride</h1>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <input
              type="text"
              placeholder="Departure location"
              className="w-full p-4 rounded-lg border border-gray-300"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <input
              type="text"
              placeholder="Destination"
              className="w-full p-4 rounded-lg border border-gray-300"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
            <input
              type="datetime-local"
              className="w-full p-4 rounded-lg border border-gray-300"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-4">
            <button onClick={findRides} disabled={isLoading} className="w-1/2 bg-[#ffc727] py-4 rounded-lg">
              {isLoading ? "Searching..." : "Find Rides"}
            </button>
            <button onClick={() => setShowAddRide(true)} className="w-1/2 border py-4 rounded-lg">
              Offer a Ride
            </button>
          </div>
        </div>

        <div className="mt-10 space-y-6">
          {rides.length > 0 ? (
            rides.map((ride, index) =>
              ride ? (
                <div
                  key={ride.id || index}
                  onClick={() => setSelectedRide(ride)}
                  className={`cursor-pointer transition-all p-4 rounded-lg shadow-md ${
                    selectedRide?.id === ride.id ? "bg-yellow-100 border border-yellow-400" : "bg-white"
                  }`}
                >
                  <RideCard ride={ride} />
                  {selectedRide?.id === ride.id && (
                    <button
                      onClick={() => requestRide(ride.id)}
                      className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg"
                    >
                      Request Ride
                    </button>
                  )}
                </div>
              ) : null
            )
          ) : (
            <div className="bg-white/90 rounded-lg shadow-lg p-10 text-center text-gray-500">
              {isLoading ? "Loading rides..." : "No rides found."}
            </div>
          )}
        </div>
      </main>

      {showAddRide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <AddRide closeAddRide={() => setShowAddRide(false)} />
        </div>
      )}
    </div>
  );
}
