import axios from 'axios';

const IPGEOLOCATION_API_KEY = process.env.IPGEOLOCATION_API_KEY;

export async function getLocationFromIP(ip) {
  try {
    // Handle localhost and private IPs for development
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      console.log('Development IP detected, returning Dubai as default location');
      return {
        country: 'United Arab Emirates',
        country_code: 'AE',
        city: 'Dubai',
        latitude: 25.2048,
        longitude: 55.2708,
      };
    }

    if (!IPGEOLOCATION_API_KEY) {
      throw new Error('IPGEOLOCATION_API_KEY is not configured');
    }

    const response = await axios.get(
      `https://api.ipgeolocation.io/ipgeo?apiKey=${IPGEOLOCATION_API_KEY}&ip=${ip}`,
      { timeout: 10000 }
    );
    
    return {
      country: response.data.country_name,
      country_code: response.data.country_code2,
      city: response.data.city,
      latitude: parseFloat(response.data.latitude),
      longitude: parseFloat(response.data.longitude),
    };
  } catch (error) {
    console.error('Error fetching location for IP:', ip, error.message);
    return null;
  }
}

export function isLocationAllowed(location) {
  if (!location || !location.country) {
    return false;
  }
  
  // Updated to include Indonesia
  const allowedCountries = [
    'united arab emirates', 
    'india',
    'indonesia'  
  ];
  
  const allowedCountryCodes = [
    'AE', 
    'IN',   
    'ID' 
  ];
  
  return allowedCountries.includes(location.country.toLowerCase()) ||
         allowedCountryCodes.includes(location.country_code?.toUpperCase());
}

export function getClientIP(req) {
  let ip = req.headers['x-forwarded-for'] ||
           req.headers['x-real-ip'] ||
           req.headers['cf-connecting-ip'] ||
           req.headers['x-client-ip'] ||
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           req.connection?.socket?.remoteAddress ||
           '127.0.0.1';

  if (typeof ip === 'string' && ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }

  if (ip && ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  return ip || '127.0.0.1';
}