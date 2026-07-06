import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenancy";

// GET agents
export async function GET(req: NextRequest) {
  const { error, org } = await requireOrg(req);
  if (error) return error;

  const agents = await prisma.agent.findMany({
    where: { organizationId: org!.id },
  });

  return NextResponse.json(agents);
}

// POST create agent
export async function POST(req: NextRequest) {
  const { error, org } = await requireOrg(req);
  if (error) return error;

  try {
    const data = await req.json();

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
        organizationId: org!.id,
      },
    });

    return NextResponse.json(agent);
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json(
        { error: "Agent with this email already exists for your organization." },
        { status: 409 }
      );
    }
    console.error("Agent creation error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
