import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
  }

  try {
    const orgs = await prisma.organization.findMany({
      include: {
        members: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedOrgs = orgs.map(org => {
      const owner = org.members.find(m => m.role === 'OWNER' || m.role === 'ADMIN')?.user;
      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        adminEmail: owner?.email || 'N/A',
        memberCount: org.members.length,
        createdAt: org.createdAt
      };
    });

    return NextResponse.json(formattedOrgs);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
  }

  try {
    const { companyName, email, password } = await req.json();

    if (!companyName || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email } });
    
    // We can wrap this in a transaction
    const result = await prisma.$transaction(async (tx) => {
      if (!user) {
        user = await tx.user.create({
          data: { email, passwordHash },
        });
      }

      // Check if org slug exists and append random numbers if it does
      let finalSlug = slug;
      let counter = 1;
      while (await tx.organization.findUnique({ where: { slug: finalSlug } })) {
        finalSlug = `${slug}-${counter}`;
        counter++;
      }

      const org = await tx.organization.create({
        data: {
          name: companyName,
          slug: finalSlug,
        }
      });

      await tx.orgMember.create({
        data: {
          organizationId: org.id,
          userId: user!.id,
          role: "OWNER",
        }
      });

      return { org, user };
    });

    return NextResponse.json({ success: true, organization: result.org }, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Failed to create Admin" }, { status: 500 });
  }
}
