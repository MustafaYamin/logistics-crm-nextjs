import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenancy";

export async function GET(req: NextRequest) {
  const { error, org } = await requireOrg(req);
  if (error) return error;

  const members = await prisma.orgMember.findMany({
    where: { organizationId: org!.id },
    include: { user: true },
  });

  return NextResponse.json(members);
}

export async function POST(req: NextRequest) {
  const { error, org, role } = await requireOrg(req);
  if (error) return error;

  if (role !== "ADMIN" && role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const currentTotalMembers = await prisma.orgMember.count({
      where: { organizationId: org!.id },
    });

    // 1 Admin/Owner + 5 Members = max 6 users per org
    if (currentTotalMembers >= 6) {
      return NextResponse.json({ error: "Member limit reached. You can only create up to 5 additional members." }, { status: 403 });
    }

    const { email, password, orgRole } = await req.json();
    if (!email || !password || !orgRole) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, passwordHash },
      });
    }

    const existingMember = await prisma.orgMember.findUnique({
      where: { organizationId_userId: { organizationId: org!.id, userId: user.id } },
    });

    if (existingMember) {
      return NextResponse.json({ error: "User is already in this organization" }, { status: 409 });
    }

    const member = await prisma.orgMember.create({
      data: {
        organizationId: org!.id,
        userId: user.id,
        role: orgRole,
      },
      include: { user: true },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to add user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { error, org, role } = await requireOrg(req);
  if (error) return error;

  if (role !== "ADMIN" && role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await req.json(); // This id is the userId
    if (!id) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    await prisma.orgMember.delete({
      where: { organizationId_userId: { organizationId: org!.id, userId: id } },
    });

    return NextResponse.json({ message: "User removed from organization ✅" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to remove user" }, { status: 500 });
  }
}