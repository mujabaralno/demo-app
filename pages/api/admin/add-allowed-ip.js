import { supabaseAdmin } from '../../../lib/supabase';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify admin token
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { user_id, ip_address, description } = req.body;

    if (!user_id || !ip_address) {
      return res.status(400).json({ message: 'User ID and IP address are required' });
    }

    // Add allowed IP
    const { data, error } = await supabaseAdmin
      .from('AllowedIP')
      .insert({
        user_id,
        ip_address: ip_address.trim(),
        description: description || 'Added by admin'
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ message: 'IP address already allowed for this user' });
      }
      console.error('Error adding allowed IP:', error);
      return res.status(500).json({ message: 'Failed to add allowed IP' });
    }

    res.status(201).json({
      success: true,
      message: 'Allowed IP added successfully',
      data
    });

  } catch (error) {
    console.error('Add allowed IP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}