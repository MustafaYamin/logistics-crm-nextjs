

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
// import { authOptions } from "../../auth/[...nextauth]/route";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user && "id" in session.user ? Number(session.user.id) : NaN;
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const agents = await req.json();

    if (!Array.isArray(agents)) {
      return NextResponse.json({ error: "Invalid input: expected an array of agents." }, { status: 400 });
    }

    // Validate data before insert
    const validAgents = agents.filter((a: any) => {
      return (
        a.name?.trim() &&
        a.email?.trim() &&
        /\S+@\S+\.\S+/.test(a.email) && // simple email regex
        a.phone?.trim()
      );
    });

    if (!validAgents.length) {
      return NextResponse.json(
        { error: "No valid agents found in uploaded file." },
        { status: 400 }
      );
    }

    const created = await prisma.agent.createMany({
      data: validAgents.map((a: any) => ({
        name: a.name,
        email: a.email,
        phone: a.phone,
        company: a.company || null,
        address: a.address || null,
        city: a.city || null,
        country: a.country || null,
        userId,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      totalUploaded: agents.length,
      validImported: created.count,
      skipped: agents.length - validAgents.length,
    });
  } catch (err) {
    console.error("Bulk upload error:", err);
    return NextResponse.json(
      { error: "Failed to process bulk upload" },
      { status: 500 }
    );
  }
}
