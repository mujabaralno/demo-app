// pages/api/test/my-ip.js
import { getClientIP, getLocationFromIP } from '../../../lib/location';

export default async function handler(req, res) {
  try {
    const ip = getClientIP(req);
    const location = await getLocationFromIP(ip);
    
    res.json({
      success: true,
      ip,
      location,
      headers: {
        'x-forwarded-for': req.headers['x-forwarded-for'],
        'x-real-ip': req.headers['x-real-ip'],
        'cf-connecting-ip': req.headers['cf-connecting-ip'],
        'user-agent': req.headers['user-agent']
      },
      message: 'IP and location detection working!'
    });
  } catch (error) {
    console.error('Error in my-ip endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}