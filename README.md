# Acumen Freight Solutions

A web app to manage freight agents and send bulk email campaigns.

---

## Features

- **Agent Management:** Add, edit, delete, and bulk import agents.
- **Agent Selection:** Search and select agents for campaigns.
- **Bulk Email Campaigns:** Send personalized emails to selected agents.
- **Status Tracking:** See real-time email delivery and response status.
- **Bulk Upload:** Import agents from Excel/CSV files.

---

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd freight
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file:
   ```
   DATABASE_URL=mysql://user:password@host:port/database
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your@email.com
   SMTP_PASS=yourpassword
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

5. **Build and start the app**
   ```bash
   npm run build
   npm start
   ```

   For development:
   ```bash
   npm run dev
   ```

---

## Usage

- **Manage Agents:** Add/edit/delete or bulk import agents.
- **Select Agents:** Search and select agents for your campaign.
- **Send Emails:** Customize and send emails, then track their status.

---

## Scripts

- `npm run dev` – Start development server
- `npm run build` – Build for production
- `npm start` – Start production server
- `npm run lint` – Run linter

---

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS, Radix UI
- **Backend:** Next.js API routes, Prisma, MySQL, Nodemailer
- **Other:** XLSX (Excel), Lucide React (icons)

---

## Deployment Notes

- **Production build required:**  
  Run `npm run build` locally and upload the `.next` folder, or build on the server before starting.
- **Start with:**  
  `npm start` (uses `server.js` for custom server)

---

## License

Private, for Acumen Freight Solutions internal use.
