"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Navbar from "../../components/Navbar";
import RequestCard from "../../components/RequestCard";

export default function RequestsPage() {
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState({ pending: [], approved: [], received: [] });
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/auth/login";
    }
  }, [status]);

  useEffect(() => {
    if (session?.user?.email) fetchUserDetails(session.user.email);
  }, [session]);

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  useEffect(() => {
    console.log("Updated Requests State:", requests);
  }, [requests]);

  const fetchUserDetails = async (email) => {
    try {
      setIsLoading(true);
      const res = await fetch(`http://127.0.0.1:8000/auth/user/details?email=${email}`);
      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
  
      const [userRequests, receivedRequests] = await Promise.all([
        fetch(`http://127.0.0.1:8000/requests/requests/${user.id}`).then((res) => res.json()),
        fetch(`http://127.0.0.1:8000/requests/requests/received/${user.id}`).then((res) => res.json()),
      ]);
  
      const allRequests = {
        pending: userRequests?.pending || [],
        approved: userRequests?.approved || [],
        received: receivedRequests || [],
      };
  
      // Fetch ride and user details for all requests
      await fetchRideAndUserDetails(allRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setIsLoading(false);
    }
  };
  

  const fetchRideAndUserDetails = async (requestsData) => {
    try {
      const rideIds = [
        ...requestsData.pending.map((r) => r.rideId),
        ...requestsData.approved.map((r) => r.rideId),
        ...requestsData.received.map((r) => r.rideId),
      ];
  
      const userIds = [
        ...requestsData.pending.map((r) => r.userId),
        ...requestsData.approved.map((r) => r.userId),
        ...requestsData.received.map((r) => r.userId),
      ];
  
      const uniqueRideIds = [...new Set(rideIds)];
      const uniqueUserIds = [...new Set(userIds)];
  
      // Fetch ride details
      const rideDetailsPromises = uniqueRideIds.map((rideId) =>
        fetch(`http://127.0.0.1:8000/rides/ride/${rideId}`).then((res) => res.json())
      );
  
      // Fetch user details
      const userDetailsPromises = uniqueUserIds.map((userId) =>
        fetch(`http://127.0.0.1:8000/auth/user/details?user_id=${userId}`).then((res) => res.json())
      );
  
      const rideDetailsArray = await Promise.all(rideDetailsPromises);
      const userDetailsArray = await Promise.all(userDetailsPromises);
  
      const rideDetailsMap = Object.fromEntries(rideDetailsArray.map((ride) => [ride.id, ride]));
      const userDetailsMap = Object.fromEntries(userDetailsArray.map((user) => [user.id, user]));
  
      setRequests({
        pending: requestsData.pending.map((req) => ({
          ...req,
          ride: rideDetailsMap[req.rideId] || null,
          user: userDetailsMap[req.userId] || { name: "Unknown User", phone_number: "" },
        })),
        approved: requestsData.approved.map((req) => ({
          ...req,
          ride: rideDetailsMap[req.rideId] || null,
          user: userDetailsMap[req.userId] || { name: "Unknown User", phone_number: "" },
        })),
        received: requestsData.received.map((req) => ({
          ...req,
          ride: rideDetailsMap[req.rideId] || null,
          user: userDetailsMap[req.userId] || { name: "Unknown User", phone_number: "" },
        })),
      });
    } catch (error) {
      console.error("Error fetching ride and user details:", error);
    }
  };
  
  

  const handleAction = async (action, requestId) => {
    try {
      await fetch(`http://127.0.0.1:8000/requests/requests/${action}/${requestId}`, { method: "POST" });
      fetchRequests();
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
    }
  };

  const transformRequests = (requestsData) => {
    return {
      pending: requestsData.pending.map((req) => ({
        id: req.id,
        rideDetails: `${req.ride.from_location} → ${req.ride.to_location}`,
        requesterName: req.user ? req.user.name : "Unknown User",
        posterName: "You",
        departureTime: new Date(req.ride.time).toLocaleString(),
        availableSeats: req.ride.seats_available,
        passengers: [],
      })),
      approved: requestsData.approved.map((req) => ({
        id: req.id,
        rideDetails: `${req.ride.from_location} → ${req.ride.to_location}`,
        requesterName: req.user ? req.user.name : "Unknown User",
        posterName: req.user ? req.user.name : "Unknown User",
        departureTime: new Date(req.ride.time).toLocaleString(),
        availableSeats: req.ride.seats_available,
        passengers: req.passengers || [],
      })),
      received: requestsData.received.map((req) => ({
        id: req.id,
        rideDetails: `${req.ride.from_location} → ${req.ride.to_location}`,
        requesterName: req.user ? req.user.name : "Unknown User",
        posterName: req.ride.driver_id === req.userId ? "You" : "Unknown User",
        departureTime: new Date(req.ride.time).toLocaleString(),
        availableSeats: req.ride.seats_available,
        passengers: [],
      })),
    };
  };
  
  useEffect(() => {
    const fetchedRequests = {
      pending: [
        {
          id: "15",
          rideId: "11",
          status: "pending",
          userId: "7",
          ride: {
            driver_id: "1",
            from_location: "Town Hall",
            to_location: "Amrita College",
            id: "11",
            time: "2025-03-13T18:30:00",
            seats_available: 2,
          },
          user: {
            id: "7",
            name: "John Doe",
          },
        },
      ],
      approved: [
        {
          id: "10",
          rideId: "6",
          status: "approved",
          userId: "1",
          ride: {
            driver_id: "1",
            from_location: "Amrita College",
            to_location: "Gandhipuram",
            id: "6",
            time: "2025-03-13T09:00:00",
            seats_available: 2,
          },
          user: {
            id: "1",
            name: "Alice Smith",
          },
        },
      ],
      received: [],
    };
  
    setRequests(transformRequests(fetchedRequests));
  }, []);

  
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-gray-100 relative">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">My Ride Requests</h1>
        <div className="flex gap-4 border-b pb-2">
          {["received", "pending", "approved"].map((t) => (
            <button
              key={t}
              className={`px-4 py-2 text-sm font-medium ${tab === t ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)} Requests
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-10">Loading requests...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {requests[tab]?.map((req) => (
              <RequestCard
                key={req.id}
                request={{
                  id: req.id,
                  rideDetails: req.ride
                    ? `${req.ride.from_location} → ${req.ride.to_location}`
                    : "Ride details unavailable",
                  requesterName: tab === "received" ? req.user?.name || "Unknown User" : "",
                  posterName: tab === "pending" ? req.user?.name || "Unknown User" : "",
                  departureTime: req.ride ? new Date(req.ride.time).toLocaleString() : "N/A",
                  availableSeats: req.ride ? req.ride.seats_available : "N/A",
                  passengers: tab === "approved" ? req.passengers || [] : [],
                }}
                type={tab}
                onApprove={(id) => handleAction("approve", id)}
                onDecline={(id) => handleAction("reject", id)}
                onCancel={(id) => handleAction("cancel", id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
