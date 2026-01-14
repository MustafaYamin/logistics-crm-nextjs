import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const queries = await prisma.freightQuery.findMany({
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json(queries);
    } catch (error) {
      console.error('[freight-queries] Error fetching:', error);
      res.status(500).json({ error: 'Failed to fetch queries' });
    }
  } else if (req.method === 'POST') {
    try {
      // Remove id if present, let DB handle it
      const { id, ...data } = req.body;
      const query = await prisma.freightQuery.create({
        data: {
            origin: data.origin,
            destination: data.destination,
            cargoType: data.cargoType,
            weight: data.weight,
            dimensions: data.dimensions,
            pickupDate: data.pickupDate,
            deliveryDate: data.deliveryDate,
            specialRequirements: data.specialRequirements
        }
      });
      res.status(201).json(query);
    } catch (error) {
      console.error('[freight-queries] Error creating:', error);
      res.status(500).json({ error: 'Failed to save query' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, ...update } = req.body;
      await prisma.freightQuery.update({
        where: { id: Number(id) },
        data: update
      });
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('[freight-queries] Error updating:', error);
      res.status(500).json({ error: 'Failed to update query' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      await prisma.freightQuery.delete({
        where: { id: Number(id) }
      });
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('[freight-queries] Error deleting:', error);
      res.status(500).json({ error: 'Failed to delete query' });
    }
  } else {
    res.status(405).end();
  }
}