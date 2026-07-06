import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptString, decryptString } from "@/lib/encryption";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;
  
  if (user.orgRole !== "OWNER" && user.orgRole !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  const orgId = Number(user.orgId);
  if (!orgId) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      smtpHost: true,
      smtpPort: true,
      smtpUser: true,
      smtpPass: true,
    }
  });

  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  // We return the configured fields, but we mask the password
  return NextResponse.json({
    smtpHost: org.smtpHost || "",
    smtpPort: org.smtpPort || "",
    smtpUser: org.smtpUser || "",
    hasPassword: !!org.smtpPass,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;

  if (user.orgRole !== "OWNER" && user.orgRole !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  const orgId = Number(user.orgId);
  if (!orgId) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const body = await req.json();
  const { smtpHost, smtpPort, smtpUser, smtpPass } = body;

  const updateData: any = {};
  
  if (smtpHost !== undefined) updateData.smtpHost = smtpHost;
  if (smtpPort !== undefined) updateData.smtpPort = Number(smtpPort) || null;
  if (smtpUser !== undefined) updateData.smtpUser = smtpUser;
  
  if (smtpPass) {
    updateData.smtpPass = encryptString(smtpPass);
  }

  await prisma.organization.update({
    where: { id: orgId },
    data: updateData,
  });

  return NextResponse.json({ success: true });
}
