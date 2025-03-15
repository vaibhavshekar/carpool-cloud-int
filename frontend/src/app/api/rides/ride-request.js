import { getServerSession } from "next-auth";
import { prisma } from "../../../lib/prisma";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { rideId } = req.body;
  if (!rideId) {
    return res.status(400).json({ error: "Ride ID is required" });
  }

  try {
    const existingRequest = await prisma.request.findFirst({
      where: {
        rideId,
        userId: session.user.id,
      },
    });

    if (existingRequest) {
      return res.status(400).json({ error: "You have already requested this ride." });
    }

    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
    });

    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    const newRequest = await prisma.request.create({
      data: {
        rideId,
        userId: session.user.id,
        status: "pending",
      },
    });

    return res.status(201).json(newRequest);
  } catch (error) {
    console.error("Request Ride Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
