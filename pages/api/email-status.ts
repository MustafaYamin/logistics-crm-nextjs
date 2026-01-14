import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const statuses = await prisma.emailStatus.findMany({
        orderBy: { updatedAt: 'desc' }
      });
      res.status(200).json(statuses);
    } catch (error) {
      console.error('[email-status] Error fetching:', error);
      res.status(500).json({ error: 'Failed to fetch statuses' });
    }
  } else if (req.method === 'POST') {
    try {
      const { id, ...data } = req.body;
      const status = await prisma.emailStatus.create({
        data: {
          agentName: data.agentName,
          email: data.email,
          status: data.status,
          sentAt: data.sentAt ? new Date(data.sentAt) : null,
          openedAt: data.openedAt ? new Date(data.openedAt) : null,
          repliedAt: data.repliedAt ? new Date(data.repliedAt) : null,
        }
      });
      res.status(201).json(status);
    } catch (error) {
      console.error('[email-status] Error creating:', error);
      res.status(500).json({ error: 'Failed to save status' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, ...update } = req.body;
      
      // Convert string dates to Date objects if present
      if (update.sentAt) update.sentAt = new Date(update.sentAt);
      if (update.openedAt) update.openedAt = new Date(update.openedAt);
      if (update.repliedAt) update.repliedAt = new Date(update.repliedAt);

      await prisma.emailStatus.update({
        where: { id: Number(id) },
        data: update
      });
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('[email-status] Error updating:', error);
      res.status(500).json({ error: 'Failed to update status' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      await prisma.emailStatus.delete({
        where: { id: Number(id) }
      });
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('[email-status] Error deleting:', error);
      res.status(500).json({ error: 'Failed to delete status' });
    }
  } else {
    res.status(405).end();
  }
}