import { supabaseAdmin } from '../../../lib/supabase';
import { hashPassword, verifyToken } from '../../../lib/auth';

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

    const { employee_id, password, role = 'user', allowed_ips = [] } = req.body;

    // Validate input
    if (!employee_id || !password) {
      return res.status(400).json({ message: 'Employee ID and password are required' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('employee_id', employee_id)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .insert({
        employee_id,
        password: hashedPassword,
        role
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      return res.status(500).json({ message: 'Failed to create user' });
    }

    // Add allowed IPs if provided
    if (allowed_ips && allowed_ips.length > 0) {
      const ipRecords = allowed_ips.map(ip => ({
        user_id: user.id,
        ip_address: ip.trim(),
        description: `Added during user creation`
      }));

      const { error: ipError } = await supabaseAdmin
        .from('AllowedIP')
        .insert(ipRecords);

      if (ipError) {
        console.error('Error adding allowed IPs:', ipError);
        // Don't fail the user creation, just log the error
      }
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user.id,
        employee_id: user.employee_id,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}