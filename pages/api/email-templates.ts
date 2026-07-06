import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { requireOrgPages } from '@/lib/tenancy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { error, org } = await requireOrgPages(req, res);
  if (error) return;

  if (req.method === 'GET') {
    try {
      const templates = await prisma.emailTemplate.findMany({
        where: { organizationId: org!.id },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json(templates);
    } catch (error) {
      console.error('[email-templates] Error fetching templates:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, subject, htmlContent } = req.body;
      
      if (!name || !subject || !htmlContent) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const template = await prisma.emailTemplate.create({
        data: { organizationId: org!.id, name, subject, htmlContent }
      });
      
      res.status(201).json(template);
    } catch (error) {
      console.error('[email-templates] Error creating template:', error);
      res.status(500).json({ error: 'Failed to create template' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Template ID is required' });
      }

      const existing = await prisma.emailTemplate.findUnique({ where: { id: parseInt(id) } });
      if (!existing || existing.organizationId !== org!.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await prisma.emailTemplate.delete({
        where: { id: parseInt(id) }
      });
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('[email-templates] Error deleting template:', error);
      res.status(500).json({ error: 'Failed to delete template' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
