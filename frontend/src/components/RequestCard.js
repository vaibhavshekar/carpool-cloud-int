const RequestCard = ({ request, type, onApprove, onDecline, onCancel }) => {
  console.log("RequestCard received request:", request);

  return (
    <div className="bg-white shadow-md rounded-lg p-5 border border-gray-200 transition-all hover:shadow-lg">
      <h3 className="text-lg font-semibold">{request.rideDetails || "Fetching ride details..."}</h3>
      <p className="text-gray-700"><strong>Time:</strong> {request.departureTime || "Loading..."}</p>
      <p className="text-gray-700"><strong>Seats Available:</strong> {request.availableSeats ?? "Loading..."}</p>

    

      {type === "approved" && (
        <p className="text-gray-700">
          Contact: <span className="font-medium">{request.user?.phone_number || "9898123456"}</span>
        </p>
      )}

      <div className="mt-5 flex gap-3">
        {type === "received" && (
          <>
            <button onClick={() => onApprove(request.id)} className="flex-1 bg-green-500 text-white px-4 py-2 rounded">Approve</button>
            <button onClick={() => onDecline(request.id)} className="flex-1 bg-red-500 text-white px-4 py-2 rounded">Decline</button>
          </>
        )}
        {type === "pending" && (
          <button onClick={() => onCancel(request.id)} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded">Cancel</button>
        )}
      </div>
    </div>
  );
};

export default RequestCard;
