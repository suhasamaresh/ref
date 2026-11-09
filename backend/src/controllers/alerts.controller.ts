import type { Request, Response, NextFunction } from 'express';

// Minimal sample alerts for prototype
const SAMPLE_ALERTS = [
  {
    id: 'alert-1',
    title: 'Flooding in Riverside district',
    message: 'Severe flooding reported. Avoid low-lying roads and seek higher ground. Temporary shelter opened at Community Center A.',
    lat: 40.731,
    lng: -73.935,
    severity: 'critical',
    source: 'EmergencyServices',
    createdAt: new Date().toISOString()
  }
];

export const getAlerts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng, radius } = req.query as any;
    let items = SAMPLE_ALERTS;
    if (lat && lng) {
      const latN = parseFloat(lat);
      const lngN = parseFloat(lng);
      const maxDistDeg = (parseFloat(radius || '5000') / 111000) || 0.05;
      items = items.filter(i => Math.abs(i.lat - latN) <= maxDistDeg && Math.abs(i.lng - lngN) <= maxDistDeg);
    }

    return res.json({ success: true, data: items });
  } catch (err) {
    return next(err as any);
  }
};

export default { getAlerts };
