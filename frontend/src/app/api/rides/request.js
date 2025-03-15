import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getSession({ req });
  if (!session) return res.status(401).json({ message: "Unauthorized" });

  const { rideId } = req.body;

  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) return res.status(404).json({ message: "Ride not found." });

  const request = await prisma.request.create({
    data: { rideId, userId: session.user.id },
  });

  res.json(request);
}
