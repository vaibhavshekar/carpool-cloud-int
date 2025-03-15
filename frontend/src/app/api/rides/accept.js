import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getSession({ req });
  if (!session) return res.status(401).json({ message: "Unauthorized" });

  const { requestId } = req.body;

  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: { ride: true },
  });

  if (!request) return res.status(404).json({ message: "Request not found." });

  if (request.ride.driverId !== session.user.id) {
    return res.status(403).json({ message: "Only the ride owner can accept requests." });
  }

  if (request.ride.seatsAvailable === 0) {
    return res.status(400).json({ message: "No seats available." });
  }

  await prisma.request.update({
    where: { id: requestId },
    data: { status: "accepted", acceptedAt: new Date() },
  });

  await prisma.ride.update({
    where: { id: request.rideId },
    data: { seatsAvailable: request.ride.seatsAvailable - 1 },
  });

  res.json({ message: "Request accepted" });
}
