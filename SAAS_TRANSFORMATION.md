# SaaS Transformation Plan — Acumen Freight Solutions CRM

## Executive Summary

Acumen Freight Solutions is currently a single-tenant logistics CRM that helps freight companies manage their agent networks and run personalized bulk email campaigns for freight quotations. The core product-market fit is proven: freight operators need a purpose-built tool to contact and track dozens (or hundreds) of agents per shipment inquiry, something generic CRMs like HubSpot or Salesforce don't do well out of the box.

The path to SaaS is straightforward because the data model already has a `userId` boundary on every agent record. The primary work is hardening that boundary, adding a billing layer, and splitting the infrastructure from a single deployment into a scalable, tenant-isolated service.

---

## 1. Business Model Analysis

### What the product does today

A freight brokerage or forwarder:
1. Maintains a directory of freight agents (carriers, co-loaders, truckers) organized by country/city.
2. Receives a shipment inquiry (origin, destination, cargo, weight, dates).
3. Selects the relevant agents from their directory.
4. Sends each agent a personalized email quoting the freight opportunity.
5. Tracks who opened, replied, or ignored the email.

### Why it's a good SaaS candidate

- **High frequency, high value**: Freight brokers run dozens of these campaigns per week. Each successful match generates real revenue (a freight deal is typically $5K–$500K+).
- **Sticky data**: An agent directory built up over months/years is hard to migrate away from.
- **Network effect potential**: As the platform grows, aggregate send patterns and open-rate benchmarks become a unique data asset.
- **Underserved niche**: No major SaaS CRM is optimized for the freight email-campaign workflow.
- **Clear buyer**: The decision-maker is the freight operations manager or owner — a single seat buyer with budget authority.

### Target customer segments

| Segment | Company Size | Agents Managed | Willingness to Pay |
|---|---|---|---|
| Independent freight brokers | 1–5 employees | 50–200 agents | $49–$99/mo |
| Regional forwarders | 10–50 employees | 200–2,000 agents | $199–$499/mo |
| Large freight companies | 50–500 employees | 2,000–20,000 agents | $999–$5,000/mo (enterprise) |

---

## 2. Current State vs. SaaS State

| Dimension | Current (Single-Tenant) | Required for SaaS |
|---|---|---|
| Tenant isolation | `userId` filter in queries | Row-level or schema-level isolation |
| Authentication | One shared admin/user pool | Per-tenant user management |
| Billing | None | Stripe subscription management |
| Email SMTP | One shared SMTP credential | Per-tenant SMTP or managed sending infra |
| Storage | Local `/public/uploads` folder | Cloud storage (S3 or Cloudflare R2) |
| Email tracking | Assumed delivery, no webhooks | Open/click tracking pixels + reply webhooks |
| Onboarding | Manual admin creates accounts | Self-serve signup flow |
| Analytics | None | Usage metrics, deliverability stats |
| Scalability | Single Node.js process | Background job queue, horizontal scaling |
| Infrastructure | Single server | Multi-region, containerized |

---

## 3. Multi-Tenancy Architecture

### Recommended approach: Shared database, row-level isolation

The existing `userId` foreign key on `Agent` is the right foundation. Extend this pattern to every table.

**What changes in the schema:**

```prisma
// Add an Organization model as the tenant root
model Organization {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique           // used in URLs: app.acumen.io/org/[slug]
  plan        Plan      @default(FREE)
  stripeCustomerId  String?  @unique
  stripeSubscriptionId String? @unique
  seats       Int       @default(1)
  createdAt   DateTime  @default(now())
  users       OrgMember[]
  agents      Agent[]
  emailTemplates EmailTemplate[]
  freightQueries FreightQuery[]
  emailStatuses  EmailStatus[]
}

model OrgMember {
  id             String       @id @default(cuid())
  organizationId String
  userId         String
  role           OrgRole      @default(MEMBER)  // OWNER, ADMIN, MEMBER
  organization   Organization @relation(...)
  user           User         @relation(...)
}

enum Plan {
  FREE
  STARTER
  GROWTH
  ENTERPRISE
}
```

**Every query gets a tenancy guard:**

```typescript
// lib/tenancy.ts — call this at the top of every API route
export async function requireOrg(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) throw new UnauthorizedError();
  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id },
    include: { organization: true },
  });
  if (!membership) throw new ForbiddenError();
  return { session, org: membership.organization, role: membership.role };
}

// Usage in any route:
const { org } = await requireOrg(req);
const agents = await prisma.agent.findMany({ where: { organizationId: org.id } });
```

This is a low-risk migration: no schema explosion, no cross-tenant data leakage possible once the guard is in place, and Prisma enforces it at query time.

---

## 4. Authentication & Onboarding Redesign

### Self-serve signup flow

```
/signup → collect name, email, company, password
       → create User + Organization (slug from company name)
       → assign OWNER role
       → send verification email
       → redirect to /onboarding (SMTP setup, import first agents)
```

### Invitation system (team seats)

```
/dashboard/settings/team
  → Owner enters email + role
  → System sends invite link with signed token
  → Recipient clicks link → creates account → joins org
```

### SSO (Enterprise tier)

- Add SAML/OIDC provider support via NextAuth.js custom providers.
- Map IdP groups to OrgRoles.

---

## 5. Pricing Model

### Recommended: Seat + Usage hybrid

Freight companies care about two things: how many people use the tool and how many emails they send.

| Plan | Price | Seats | Agents | Emails/mo | Features |
|---|---|---|---|---|---|
| **Free** | $0 | 1 | 100 | 500 | Core CRM, 1 template |
| **Starter** | $59/mo | 3 | 1,000 | 5,000 | Bulk import, 10 templates |
| **Growth** | $149/mo | 10 | 10,000 | 25,000 | Analytics, custom SMTP, reply tracking |
| **Enterprise** | Custom | Unlimited | Unlimited | Unlimited | SSO, SLA, dedicated support, API |

**Usage overages** (for Starter/Growth): $2 per 1,000 emails over limit.

**Annual discount**: 2 months free (16% off).

### Why this model works for freight

- Low entry point (Free) lets solo brokers get value and grow into paid plans.
- Seats scale naturally as companies hire ops coordinators.
- Email volume is the value metric — a busy broker who closes deals using the tool sends more emails and pays more.

---

## 6. Billing Integration (Stripe)

### What to build

**`/api/billing/checkout`** — Creates a Stripe Checkout session for plan upgrades.

**`/api/billing/portal`** — Opens the Stripe Customer Portal for plan management.

**`/api/webhooks/stripe`** — Handles subscription lifecycle events:

```typescript
// Stripe events to handle:
'checkout.session.completed'  → activate subscription, set org.plan
'invoice.payment_succeeded'   → renew subscription period
'invoice.payment_failed'      → send dunning email, lock sending
'customer.subscription.deleted' → downgrade to Free plan
```

**Enforcement at API layer:**

```typescript
// lib/planLimits.ts
const LIMITS = {
  FREE:       { agents: 100,    emails: 500,    seats: 1  },
  STARTER:    { agents: 1000,   emails: 5000,   seats: 3  },
  GROWTH:     { agents: 10000,  emails: 25000,  seats: 10 },
  ENTERPRISE: { agents: Infinity, emails: Infinity, seats: Infinity },
};

export async function assertEmailQuota(org: Organization) {
  const sent = await prisma.emailStatus.count({
    where: { organizationId: org.id, sentAt: { gte: startOfCurrentBillingPeriod(org) } },
  });
  if (sent >= LIMITS[org.plan].emails) throw new QuotaExceededError('email');
}
```

---

## 7. Email Infrastructure Redesign

The current single-SMTP setup is a hard blocker for SaaS because:
- One bad sender reputation hurts all tenants.
- There is no real delivery/open tracking.
- A synchronous send loop inside a Next.js API route will hit timeouts at scale.

### Option A — Managed Email API (recommended for launch)

Replace Nodemailer with **Resend** or **Postmark**:

- Per-tenant sender domains (tenants verify their own domain: `Verified Domain: acmecargo.com`).
- Webhook callbacks for opens, clicks, bounces, unsubscribes.
- Deliverability infrastructure handled externally.
- Cost: ~$0.80–$1.00 per 1,000 emails (pass through to customer or bundle in plan price).

```typescript
// lib/email/resend.ts
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendFreightEmail(to: string, html: string, from: string) {
  return resend.emails.send({ from, to, subject: '...', html });
}
```

**Webhook handler:**

```typescript
// /api/webhooks/resend
// Events: email.opened, email.clicked, email.bounced, email.complained
// → update EmailStatus record accordingly
```

### Option B — Bring Your Own SMTP (keep current behavior)

Allow tenants to configure their own SMTP (Gmail App Password, SendGrid, etc.):

- Store encrypted SMTP credentials per organization.
- Validate connection on save.
- Used for Growth/Enterprise plans; Managed API used for Free/Starter.

### Background job queue

Email campaigns must run in a background worker, not inside a request handler.

**Recommended stack:** [Trigger.dev](https://trigger.dev) (open source, self-hostable) or **BullMQ** with Redis.

```typescript
// jobs/sendEmailCampaign.ts (Trigger.dev)
client.defineJob({
  id: 'send-freight-campaign',
  name: 'Send Freight Email Campaign',
  trigger: eventTrigger({ name: 'campaign.start' }),
  run: async (payload, io) => {
    for (const agent of payload.agents) {
      await io.wait('delay', payload.delaySeconds * 1000);
      await io.runTask('send-email', async () => sendFreightEmail(agent, payload));
      await io.runTask('update-status', async () => updateEmailStatus(agent.id, 'sent'));
    }
  },
});
```

---

## 8. File Storage Migration

Current: `POST /api/upload-image` saves files to `/public/uploads/` on the server disk.

This breaks immediately with horizontal scaling (file lives on one server) and makes every deployment wipe uploads.

**Replace with Cloudflare R2 or AWS S3:**

```typescript
// lib/storage.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: 'auto', endpoint: process.env.R2_ENDPOINT });

export async function uploadEmailImage(file: Buffer, filename: string, orgId: string) {
  const key = `orgs/${orgId}/email-images/${filename}`;
  await s3.send(new PutObjectCommand({ Bucket: 'acumen-uploads', Key: key, Body: file }));
  return `${process.env.CDN_URL}/${key}`;
}
```

---

## 9. Feature Roadmap for SaaS

### Phase 1 — MVP SaaS (8–12 weeks)

- [ ] Add `Organization` model, migrate all tables to `organizationId`
- [ ] Self-serve signup + email verification
- [ ] Team invitation system
- [ ] Stripe billing integration (Checkout + Portal + webhooks)
- [ ] Plan enforcement (agents, emails, seats quotas)
- [ ] Migrate file uploads to S3/R2
- [ ] Switch from Nodemailer to Resend (or Postmark) for managed sending
- [ ] Background job queue for email campaigns (BullMQ or Trigger.dev)
- [ ] Webhook-based open/click/bounce tracking
- [ ] Admin super-dashboard (view all orgs, manage plans, impersonate)

### Phase 2 — Growth Features (Weeks 12–24)

- [ ] **Analytics dashboard**: Campaign open rates, reply rates, best-performing agents, send-time optimization
- [ ] **Agent enrichment**: Auto-suggest company details (LinkedIn, Google Maps API)
- [ ] **Reply inbox**: Aggregate agent replies inside the platform (via email forwarding/IMAP polling)
- [ ] **Freight query templates**: Save recurring shipment types (e.g., "Standard FCL Asia–Europe")
- [ ] **Campaign scheduling**: Queue a campaign to send at a specific time
- [ ] **Unsubscribe management**: Auto-honor unsubscribe links, maintain suppression lists
- [ ] **Agent tagging**: Categorize agents by specialty (air, sea, land, temp-controlled)
- [ ] **CSV export**: Export filtered agent lists and campaign reports

### Phase 3 — Enterprise & Ecosystem (Weeks 24–48)

- [ ] **SSO/SAML**: Enterprise identity provider integration
- [ ] **API access**: REST API for external integrations (TMS, ERP systems)
- [ ] **Zapier/Make integration**: Trigger campaigns from external freight management tools
- [ ] **White-labeling**: Allow large freight companies to brand the platform
- [ ] **Agent self-registration portal**: Public-facing form where agents apply to join a broker's network
- [ ] **Rate card management**: Store and compare agent rate responses
- [ ] **Multi-currency**: Display rates in agent's local currency

---

## 10. Infrastructure & DevOps

### Hosting (recommended stack)

| Layer | Service | Rationale |
|---|---|---|
| App hosting | Vercel (or Railway) | Zero-config Next.js deployment, edge functions |
| Database | PlanetScale (MySQL) or Neon (Postgres) | Serverless, branching, connection pooling |
| Background jobs | Railway worker or Render.com | Persistent process for BullMQ/Trigger.dev |
| File storage | Cloudflare R2 | S3-compatible, cheap egress |
| Email sending | Resend or Postmark | High deliverability, webhooks |
| Cache/Queue | Upstash Redis | Serverless Redis for BullMQ |
| Monitoring | Sentry + Posthog | Error tracking + product analytics |
| Payments | Stripe | Industry standard |

### Estimated infrastructure cost at 100 tenants

| Service | Monthly Cost |
|---|---|
| Vercel Pro | $20 |
| PlanetScale Scaler | $39 |
| Upstash Redis | $10 |
| Resend (100K emails) | $90 |
| Cloudflare R2 | $5 |
| Railway (worker) | $20 |
| Sentry | $26 |
| **Total** | **~$210/mo** |

At $59/mo average plan, you break even at **4 paying customers**. At 100 customers the margin is ~96%.

---

## 11. Migration Plan (Existing Data)

If there are existing users/agents in the current deployment:

1. Write a one-time migration script that creates a default `Organization` for each existing `User`.
2. Set that user as `OWNER` of their organization.
3. Backfill `organizationId` on all `Agent`, `EmailTemplate`, `EmailStatus`, `FreightQuery` records.
4. Run as a Prisma migration with a transaction to guarantee atomicity.

```typescript
// scripts/migrate-to-multitenant.ts
await prisma.$transaction(async (tx) => {
  const users = await tx.user.findMany({ include: { agents: true } });
  for (const user of users) {
    const org = await tx.organization.create({ data: { name: user.email, slug: slugify(user.email) } });
    await tx.orgMember.create({ data: { organizationId: org.id, userId: user.id, role: 'OWNER' } });
    await tx.agent.updateMany({ where: { userId: user.id }, data: { organizationId: org.id } });
    // repeat for emailTemplates, emailStatuses, freightQueries
  }
});
```

---

## 12. Go-to-Market Strategy

### Distribution channels

1. **Freight industry forums & communities**: Post.gg Freight, FreightWaves, LinkedIn freight groups — these are where buyers already congregate.
2. **Product Hunt launch**: Target "logistics" and "email tools" categories for initial awareness.
3. **Cold outreach**: Use your own product to email freight forwarders (meta-demonstration of value).
4. **Partner integrations**: List on Cargowise, Freightos, or ShipBob marketplace once API is ready.
5. **SEO content**: "How to find freight agents in [country]", "freight email templates" — high-intent, low-competition keywords.

### Acquisition funnel

```
Awareness (blog, LinkedIn, forums)
    ↓
Free signup (no credit card)
    ↓
Aha moment: send first campaign, see open tracking
    ↓
Hit Free tier limit → upgrade prompt
    ↓
Starter plan conversion
    ↓
Team growth → seat expansion
    ↓
Enterprise contract (annual)
```

### Key metrics to track

- **Activation rate**: % of signups who send at least 1 email campaign
- **D30 retention**: % of activated users still active at 30 days
- **Free-to-paid conversion**: Target 5–10% within 60 days
- **Email volume per tenant**: Leading indicator of value realization
- **NPS**: Freight is a relationship business; referrals matter

---

## 13. Legal & Compliance

- **GDPR / CASL / CAN-SPAM**: Email campaigns must include unsubscribe links, physical address, and honor opt-outs. Build suppression list management into the platform.
- **Data Processing Agreements (DPA)**: Required for European customers. Provide a standard DPA on the website.
- **Terms of Service / Privacy Policy**: Must explicitly prohibit spam and define acceptable use.
- **SOC 2 Type II**: Required for enterprise deals > $10K/yr. Plan for this in Year 2.
- **Agent data ownership**: Make clear in ToS that tenant's agent lists are their data, not the platform's.

---

## 14. Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Deliverability issues (emails marked as spam) | High | High | Use managed email API, enforce domain verification, implement bounce/complaint handling |
| Tenant data leakage (missing `organizationId` guard) | Medium | Critical | Code review checklist, automated tests that assert cross-tenant isolation |
| SMTP credential misuse by tenants | Medium | High | Terms of Service, rate limits, abuse detection |
| Churn from free tier (no conversion) | High | Medium | In-app upgrade prompts at natural limit moments, not just on the settings page |
| Competitor from existing CRM players | Low | Medium | Niche focus is the moat — generic CRMs won't add freight-specific email workflows |

---

## 15. Immediate Next Steps (First 30 Days)

1. **Register a SaaS domain** — something like `acumenfreight.io` or `freightcrm.io` separate from the current deployment.
2. **Set up Stripe account** — create products/prices matching the tier structure above.
3. **Add `Organization` model** — the single highest-leverage technical change; unblocks everything else.
4. **Build self-serve signup** — without this, there is no SaaS.
5. **Integrate Resend** — replace Nodemailer; this alone will dramatically improve deliverability.
6. **Deploy to Vercel + PlanetScale** — move off a single server.
7. **Add Posthog** — start measuring activation and retention from day one.
8. **Launch with 5 beta customers** — freight broker contacts who use it free in exchange for feedback.

---

*Document prepared: May 2026. Reflects the current state of the codebase at commit `e3ad337` (initial commit) through `0eb95ec`.*
