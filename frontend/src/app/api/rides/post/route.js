import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    console.log("Session:", session);

    // Fetch user from the database to get their ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { from, to, time, seatsAvailable } = await req.json();

    if (!from || !to || !time || !seatsAvailable) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }

    const ride = await prisma.ride.create({
      data: {
        driverId: user.id, // Assign ride to the current logged-in user
        from,
        to,
        time: new Date(time),
        seatsAvailable,
      },
    });

    return NextResponse.json(ride, { status: 200 });
  } catch (error) {
    console.error("Error adding ride:", error);
    return NextResponse.json({ message: "Error adding ride" }, { status: 500 });
  }
}
