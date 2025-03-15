import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  await prisma.ride.deleteMany({
    where: {
      time: { lte: new Date() },
    },
  });

  res.json({ message: "Expired rides deleted" });
}
