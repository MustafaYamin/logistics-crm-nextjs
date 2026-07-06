import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenancy";

export async function PUT(req: NextRequest, context: any) {
  try {
    const { id } = context.params;
    if (isNaN(Number(id))) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const { error, org } = await requireOrg(req);
    if (error) return error;

    const agent = await prisma.agent.findUnique({ where: { id: Number(id) } });
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    if (agent.organizationId !== org!.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();

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
      },
    });

    return NextResponse.json(updatedAgent);
  } catch (error) {
    console.error("Agent update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: any) {
  try {
    const { id } = context.params;
    if (isNaN(Number(id))) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const { error, org } = await requireOrg(req);
    if (error) return error;

    const agent = await prisma.agent.findUnique({ where: { id: Number(id) } });
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    if (agent.organizationId !== org!.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.agent.delete({ where: { id: Number(id) } });

    return NextResponse.json({ message: "Agent deleted successfully" });
  } catch (error) {
    console.error("Agent delete error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
