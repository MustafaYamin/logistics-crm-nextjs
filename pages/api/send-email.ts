import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

const getTransporter = (): nodemailer.Transporter => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      pool: true,
      maxConnections: 5,
      connectionTimeout: 60000,
      socketTimeout: 60000,
    });
  }
  return transporter;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();
  console.log('[send-email] Request received at:', new Date().toISOString());

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, cc, subject, text, html, delaySeconds = 15 } = req.body;

  // Validate required fields - either text or html must be provided
  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      details: 'Required: to, subject, and either text or html'
    });
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return res.status(500).json({ error: 'SMTP credentials not configured' });
  }

  try {
    const transporter = getTransporter();

    // Prepare email options
    const mailOptions: any = {
      from: `"Acumen Freight Solutions" <${process.env.SMTP_USER}>`,
      to,
      subject,
    };

    // Add CC if provided in request or from environment
    if (cc) {
      mailOptions.cc = cc;
    } else if (process.env.EMAIL_CC) {
      mailOptions.cc = process.env.EMAIL_CC;
    }

    // Handle HTML or text content
    if (html) {
      // If HTML is provided, use it directly
      mailOptions.html = html;
      // Generate plain text version from HTML (strip tags)
      mailOptions.text = html.replace(/<[^>]*>/g, '').replace(/\n\s*\n/g, '\n');
    } else if (text) {
      // If only text is provided, convert to HTML
      mailOptions.text = text;
      mailOptions.html = text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }

    const info = await transporter.sendMail(mailOptions);

    const sendDuration = Date.now() - startTime;
    console.log('[send-email] Email sent in', sendDuration + 'ms');

    // Server-side delay (capped at 5 seconds to prevent timeouts)
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

  } catch (error) {
    console.error('[send-email] Error:', error);
    res.status(500).json({ 
      error: 'Failed to send email', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}