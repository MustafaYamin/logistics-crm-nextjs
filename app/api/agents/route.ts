
import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth"; // your NextAuth config
// import { authOptions } from "../auth/[...nextauth]/route";
import { authOptions } from "@/lib/auth";

// GET agents
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // If ADMIN (loginAs=ADMIN) → get all agents
  if (session.user && (session.user as any).loginAs === "ADMIN") {
    const agents = await prisma.agent.findMany();
    return NextResponse.json(agents);
  }

  // If CLIENT (or Admin logging in as Client) → get only their agents
  if (!session.user || typeof (session.user as any).id === "undefined") {
    return NextResponse.json({ error: "User ID not found in session" }, { status: 400 });
  }
  const userId = Number((session.user as any).id);
  if (isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }
  const agents = await prisma.agent.findMany({
    where: { userId },
  });

  return NextResponse.json(agents);
}
// POST create agent
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const userId = Number((session.user as any).id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    if (!data.name || !data.email) {
      return NextResponse.json({ error: "Name and Email are required." }, { status: 400 });
    }

    const agent = await prisma.agent.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone ? String(data.phone) : null,
        company: data.company,
        address: data.address,
        city: data.city,
        country: data.country,
        userId,
      },
    });

    return NextResponse.json(agent);
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json(
        { error: "Agent with this email already exists for your account." },
        { status: 409 }
      );
    }
    console.error("Agent creation error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
