# Acumen Freight Solutions - Multi-Tenant CRM

A modern, multi-tenant SaaS CRM built specifically for the freight and logistics industry. It empowers freight operators to manage their agent networks, conduct bulk quoting campaigns, and track real-time analytics.

---

## 🌟 Key Features

- **Multi-Tenant SaaS Architecture:** Complete data isolation for each organization.
- **Organization Management:** Invite and manage team members with role-based access (`OWNER`, `ADMIN`, `MEMBER`).
- **Agent Directory:** Add, edit, delete, and seamlessly bulk-import freight agents.
- **Bulk Email Campaigns:** Send personalized quoting emails to hundreds of agents concurrently.
- **Status Tracking:** Real-time visibility into email deliveries, opens, and replies.
- **Modern Premium UI:** Designed using Tailwind CSS and Shadcn for a sleek, high-end SaaS experience.

---

## 🚀 How to Run the Project Locally

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd logistics-crm-nextjs
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root directory:
```env
# Database configuration for local Docker MySQL
DATABASE_URL="mysql://admin:Ironman@2005@localhost:3306/bulk_crm"

# NextAuth configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-at-least-32-chars"

# SMTP Configuration (Required for sending freight quotes)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your@email.com"
SMTP_PASS="yourpassword"
```

### 4. Start the Database via Docker
A `docker-compose.yml` file is provided to easily spin up a local MySQL instance. Ensure you have Docker installed and running.
```bash
docker-compose up -d
```
*This starts a MySQL container named `crm_mysql` on port `3306` with the credentials specified in your `.env`.*

### 5. Run Database Migrations
Initialize the Prisma schema and push it to the database:
```bash
npx prisma generate
npx prisma db push
```
*(Alternatively, use `npx prisma migrate dev` if you prefer managing migration history).*

### 6. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
1. Navigate to **Sign Up** to create your first Organization and User account (You will be the `OWNER`).
2. You will be automatically redirected to your Organization Dashboard!

---

## 🛠 Tech Stack

- **Frontend:** Next.js 15 (App Router), React, Tailwind CSS, NextAuth.js
- **Backend:** Next.js API routes, Prisma ORM, MySQL (Dockerized)
- **Email:** Nodemailer (Planned migration to Resend)
- **Other:** Lucide React (Icons), XLSX (Excel imports)

---

## 📝 License
This project is licensed under the MIT License.
