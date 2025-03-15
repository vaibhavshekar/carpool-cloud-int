import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req) {
    try {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const { rideId } = await req.json();
      if (!rideId) {
        return NextResponse.json({ error: "Ride ID is required" }, { status: 400 });
      }
  
      const ride = await prisma.ride.findUnique({ where: { id: rideId } });
      if (!ride) {
        return NextResponse.json({ error: "Ride not found" }, { status: 404 });
      }
  
      const request = await prisma.request.create({
        data: {
          rideId,
          userId: session.user.id,
          status: "pending",
        },
      });
  
      return NextResponse.json(request, { status: 201 });
    } catch (error) {
      console.error("Error requesting ride:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }