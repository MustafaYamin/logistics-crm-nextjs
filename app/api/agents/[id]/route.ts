

import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
import { authOptions } from "@/lib/auth";
// PUT update agent
export async function PUT(req: Request, context: any) {
  try {
    const { id } = context.params;
    if (isNaN(Number(id))) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // Ensure client can only update his own agents
    const agent = await prisma.agent.findUnique({ where: { id: Number(id) } });

    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    const user = session.user as { id?: string | number; loginAs?: string };
    if (!user || (user.loginAs !== "ADMIN" && agent.userId !== Number(user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedAgent = await prisma.agent.update({
      where: { id: Number(id) },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        company: body.company,
        address: body.address,
        city: body.city,
        country: body.country,
        // Explicitly exclude userId/id/dates
      },
    });

    return NextResponse.json(updatedAgent);
  } catch (error) {
    console.error("Agent update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE agent
export async function DELETE(_req: Request, context: any) {
  try {
    const { id } = context.params;
    if (isNaN(Number(id))) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const agent = await prisma.agent.findUnique({ where: { id: Number(id) } });

    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    const user = session.user as { id?: string | number; loginAs?: string };
    if (!user || (user.loginAs !== "ADMIN" && agent.userId !== Number(user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.agent.delete({ where: { id: Number(id) } });

    return NextResponse.json({ message: "Agent deleted successfully" });
  } catch (error) {
    console.error("Agent delete error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
