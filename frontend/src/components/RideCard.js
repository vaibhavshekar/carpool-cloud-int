export default function RideCard({ ride }) {
  if (!ride) {
    return <div className="p-4 text-gray-500">Invalid ride data</div>;
  }

  return (
    <div className="p-4 border rounded-lg shadow">
      <h2 className="text-xl font-bold">Ride #{ride.id}</h2>
      <p><strong>From:</strong> {ride.from_location || "N/A"}</p>
      <p><strong>To:</strong> {ride.to_location || "N/A"}</p>
      <p><strong>Time:</strong> {ride.time ? new Date(ride.time).toLocaleString() : "N/A"}</p>
      <p><strong>Seats Available:</strong> {ride.seats_available ?? "N/A"}</p>
      <p><strong>Driver ID:</strong> {ride.driver_id || "Unknown"}</p>
    </div>
  );
}
