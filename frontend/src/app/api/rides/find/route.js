import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ Correct Next.js API Route (supports GET requests)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const time = searchParams.get("time");

    if (!from || !to || !time) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const requestedTime = new Date(time);
    console.log("Requested search time (UTC):", requestedTime);

    // ±1 hour range
    const oneHour = 60 * 60 * 1000;
    const lowerBound = new Date(requestedTime.getTime() - oneHour);
    const upperBound = new Date(requestedTime.getTime() + oneHour);

    console.log("Search Range:", { lowerBound, upperBound });
    console.log("Querying DB with:", {
      from,
      to,
      time: { gte: lowerBound, lte: upperBound },
    });

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
    return NextResponse.json(rides);
  } catch (error) {
    console.error("Error fetching rides:", error);
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}
