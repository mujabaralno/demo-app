// services/loginService.js
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const fetchLastLoginCity = async (userId) => {
  try {
    // Check if we have any data in LoginLog at all
    const { data: allData, error: testError } = await supabase
      .from('LoginLog')
      .select('*')
      .limit(5);
    
    // If no data exists, return fallback message
    if (!allData || allData.length === 0) {
      console.log('LoginLog table is empty - no login records found');
      return 'Unknown'; // Return fallback instead of null
    }

    console.log('Sample LoginLog data:', allData[0]); // Show structure of first record
    
    // Now try the actual query
    const { data, error } = await supabase
      .from('LoginLog')
      .select('city, user_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching login city:', error);
      return 'Unknown';
    }

    // Check if we have data for this specific user
    if (!data || data.length === 0) {
      console.log('No login log found for this user:', userId);
      console.log('Available user_ids in LoginLog:', allData.map(log => log.user_id));
      return 'Unknown';
    }

    return data[0]?.city || 'Unknown';
  } catch (error) {
    console.error('Catch error fetching login city:', error);
    return 'Unknown';
  }
};

// Function to create login log entry (call this during login)
export const createLoginLog = async (userId, city, ipAddress = null) => {
  try {
    const { data, error } = await supabase
      .from('LoginLog')
      .insert([
        {
          user_id: userId,
          city: city,
          ip_address: ipAddress,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Error creating login log:', error);
      return false;
    }

    console.log('Login log created:', data);
    return true;
  } catch (error) {
    console.error('Error creating login log:', error);
    return false;
  }
};

// Bisa tambah fungsi lain yang berhubungan dengan login
export const fetchLoginHistory = async (userId, limit = 5) => {
  try {
    const { data, error } = await supabase
      .from('LoginLog')
      .select('city, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching login history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching login history:', error);
    return [];
  }
};