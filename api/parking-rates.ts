import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const rates = await storage.getParkingRates();
      res.status(200).json(rates);
    } catch (error: any) {
      res.status(500).json({ message: 'Error fetching rates: ' + error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
} 