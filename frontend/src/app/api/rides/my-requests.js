import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import prisma from "../../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = session.user.id;

    const requests = await prisma.request.findMany({
      where: { userId },
      select: { rideId: true },
    });

    return res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching ride requests:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
