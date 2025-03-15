import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { from, to, time } = req.query;

  if (!from || !to || !time) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const requestedTime = new Date(time);
    console.log("Requested search time (UTC):", requestedTime);

    // Convert time to match DB stored format without timezone shifts
    const localRequestedTime = new Date(requestedTime.getTime()); // Keeping the same local time

    console.log("Converted to local time:", localRequestedTime);

    // ±1 hour range
    const oneHour = 60 * 60 * 1000;
    const lowerBound = new Date(localRequestedTime.getTime() - oneHour);
    const upperBound = new Date(localRequestedTime.getTime() + oneHour);

    console.log("Search Range:", { lowerBound, upperBound });

    const rides = await prisma.ride.findMany({
      where: {
        from,
        to,
        time: {
          gte: lowerBound,
          lte: upperBound,
        },
      },
    });

    console.log("Rides found:", rides);
    res.json(rides);
  } catch (error) {
    console.error("Error fetching rides:", error);
    res.status(500).json({ message: "Error fetching rides" });
  }
}
