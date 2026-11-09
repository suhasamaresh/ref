import type { Request, Response, NextFunction } from 'express';
import axios from 'axios';

const AI_SERVICE = process.env.AI_MATCHING_SERVICE_URL || 'http://localhost:8000';

// Minimal in-memory sample data for prototype
const SAMPLE_NEWS = [
  {
    id: 'news-1',
    title: 'Local shelter expands capacity after heavy rains',
    body: 'The downtown community shelter has expanded its capacity to support 150 additional people after severe flooding affected several neighborhoods. Volunteers are coordinating intake and providing meals.',
    lat: 40.73061,
    lng: -73.935242,
    source: 'LocalNews',
    publishedAt: new Date().toISOString()
  },
  {
    id: 'news-2',
    title: 'Urgent: Water supply interruption in Sector 4',
    body: 'Water supply will be interrupted for 12 hours due to pipe maintenance. Residents are advised to store water and follow guidance from local authorities. Aid stations will provide bottled water.',
    lat: 40.732,
    lng: -73.937,
    source: 'CityAlerts',
    publishedAt: new Date().toISOString()
  }
];

export const getNews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng, radius } = req.query as any;

    // For prototype: filter SAMPLE_NEWS by simple bounding box if coords provided
    let items = SAMPLE_NEWS;
    if (lat && lng) {
      const latN = parseFloat(lat);
      const lngN = parseFloat(lng);
      const maxDistDeg = (parseFloat(radius || '5000') / 111000) || 0.05; // rough deg conversion
      items = items.filter(i => Math.abs(i.lat - latN) <= maxDistDeg && Math.abs(i.lng - lngN) <= maxDistDeg);
    }

    // Enrich with summary via AI service (call /summarize)
    const enriched = await Promise.all(items.map(async (it) => {
      try {
        const resp = await axios.post(`${AI_SERVICE}/summarize`, { title: it.title, text: it.body, max_sentences: 2 }, { timeout: 5000 });
        const summary = resp.data && resp.data.summary ? resp.data.summary : it.body.slice(0, 200);
        return { ...it, summary };
      } catch (e) {
        return { ...it, summary: it.body.slice(0, 200) };
      }
    }));

    return res.json({ success: true, data: enriched });
  } catch (err) {
    return next(err as any);
  }
};

export default { getNews };
