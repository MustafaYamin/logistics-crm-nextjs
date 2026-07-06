import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { requireOrgPages, assertEmailQuota } from '@/lib/tenancy';
import { decryptString } from '@/lib/encryption';

const getTransporter = (org: any): nodemailer.Transporter => {
  const host = org.smtpHost || process.env.SMTP_HOST;
  const port = org.smtpPort || Number(process.env.SMTP_PORT);
  const user = org.smtpUser || process.env.SMTP_USER;
  const pass = org.smtpPass ? decryptString(org.smtpPass) : process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error('SMTP credentials not configured for this organization');
  }

  return nodemailer.createTransport({
    host: host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: {
      user: user,
      pass: pass,
    },
    pool: true,
    maxConnections: 5,
    connectionTimeout: 60000,
    socketTimeout: 60000,
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { error, org } = await requireOrgPages(req, res);
  if (error) return;

  const startTime = Date.now();
  console.log('[send-email] Request received at:', new Date().toISOString());

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, cc, subject, text, html, delaySeconds = 15 } = req.body;

  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({
      error: 'Missing required fields',
      details: 'Required: to, subject, and either text or html'
    });
  }

  try {
    await assertEmailQuota(org!.id);

    const transporter = getTransporter(org);
    const fromUser = org!.smtpUser || process.env.SMTP_USER;

    const mailOptions: any = {
      from: fromUser,
      to,
      subject,
    };

    if (cc) {
      mailOptions.cc = cc;
    } else if (process.env.EMAIL_CC) {
      mailOptions.cc = process.env.EMAIL_CC;
    }

    if (html) {
      mailOptions.html = html;
      mailOptions.text = html.replace(/<[^>]*>/g, '').replace(/\n\s*\n/g, '\n');
    } else if (text) {
      mailOptions.text = text;
      mailOptions.html = text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }

    const info = await transporter.sendMail(mailOptions);

    const sendDuration = Date.now() - startTime;
    console.log('[send-email] Email sent in', sendDuration + 'ms');

    const delay = Math.max(0, Math.min(5, Number(delaySeconds) || 0));
    if (delay > 0) {
      console.log(`[send-email] Adding ${delay}s server delay...`);
      await new Promise(resolve => setTimeout(resolve, delay * 1000));
    }

    const totalDuration = Date.now() - startTime;
    console.log('[send-email] Total request time:', totalDuration + 'ms');

    res.status(200).json({
      success: true,
      messageId: info?.messageId,
      accepted: info?.accepted,
      rejected: info?.rejected,
      sendDuration,
      totalDuration,
      delayApplied: delay
    });

  } catch (err: any) {
    console.error('[send-email] Error:', err);
    res.status(500).json({
      error: 'Failed to send email',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}