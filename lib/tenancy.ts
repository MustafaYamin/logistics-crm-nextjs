import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireOrg(req?: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const membership = await prisma.orgMember.findFirst({
    where: { userId: Number((session.user as any).id) },
    include: { organization: true },
  });

  if (!membership) {
    return { error: NextResponse.json({ error: "Forbidden: No organization found" }, { status: 403 }) };
  }

  return {
    session,
    org: membership.organization,
    role: membership.role,
  };
}

import { NextApiRequest, NextApiResponse } from "next";

export async function requireOrgPages(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || !session.user) {
    res.status(401).json({ error: "Unauthorized" });
    return { error: true };
  }

  const membership = await prisma.orgMember.findFirst({
    where: { userId: Number((session.user as any).id) },
    include: { organization: true },
  });

  if (!membership) {
    res.status(403).json({ error: "Forbidden: No organization found" });
    return { error: true };
  }

  return {
    session,
    org: membership.organization,
    role: membership.role,
  };
}

export async function assertEmailQuota(orgId: number) {
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) throw new Error("Organization not found");

  const LIMITS = {
    FREE:       { emails: 500 },
    STARTER:    { emails: 5000 },
    GROWTH:     { emails: 25000 },
    ENTERPRISE: { emails: Infinity },
  };

  const limit = LIMITS[org.plan].emails;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const sentCount = await prisma.emailStatus.count({
    where: { 
      organizationId: orgId,
      sentAt: { gte: thirtyDaysAgo }
    },
  });

  if (sentCount >= limit) {
    throw new Error(`Email quota exceeded for plan ${org.plan}`);
  }
}
