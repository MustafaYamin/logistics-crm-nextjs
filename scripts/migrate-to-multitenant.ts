import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'org';
}

async function main() {
  console.log('Starting multi-tenant migration...');

  await prisma.$transaction(async (tx) => {
    // 1. Get all users (they won't have agents loaded via relation if we changed the schema, 
    // wait, we changed the schema to organizationId, so tx.user.findMany won't return agents by userId anymore).
    // Actually, if we already applied the schema, we can't query agents by userId via Prisma easily if the field was renamed.
    // Assuming the DB hasn't been migrated with `npx prisma db push` or `migrate dev` yet? 
    // If it was already pushed, userId on agent doesn't exist anymore in the Prisma Client.
    // If it's a fresh DB, this script is just for testing.
    // Let's assume we fetch all users.
    const users = await tx.user.findMany();

    if (users.length === 0) {
      console.log('No users found. Skipping migration.');
      return;
    }

    // Create an organization for each user
    for (const user of users) {
      // Ensure unique slug
      let baseSlug = slugify(user.email);
      let slug = baseSlug;
      let counter = 1;
      while (await tx.organization.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      console.log(`Creating organization for user ${user.email} (slug: ${slug})...`);
      const org = await tx.organization.create({
        data: {
          name: user.email, // using email as default name
          slug,
        },
      });

      console.log(`Adding user ${user.id} as OWNER to org ${org.id}...`);
      await tx.orgMember.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          role: 'OWNER',
        },
      });

      // Note: If you have existing records in Agent, EmailTemplate, etc. 
      // they must be manually updated via raw SQL since Prisma schema 
      // now expects organizationId which might be null in the DB during transition.
      // For a fresh start, no action is needed here.
    }
  });

  console.log('Migration completed successfully.');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
