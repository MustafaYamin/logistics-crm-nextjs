import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {prisma} from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({ include: { roles: true } });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  try {
    const { email, password, roles } = await req.json();
    if (!email || !password || !roles?.length) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        roles: {
          create: roles.map((r: string) => ({ role: r })),
        },
      },
      include: { roles: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    // Delete related roles first
    await prisma.userRole.deleteMany({ where: { userId: id } });

    // Then delete user
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: "User deleted ✅" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}