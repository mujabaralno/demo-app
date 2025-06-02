// pages/api/auth/login.js
import { supabaseAdmin } from '../../../lib/supabase';
import { comparePassword, generateToken } from '../../../lib/auth';
import { getLocationFromIP, isLocationAllowed, getClientIP } from '../../../lib/location';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  const startTime = Date.now();

  try {
    const { employee_id, password } = req.body;
    const clientIP = getClientIP(req);

    // 1. Validate input
    const inputValidation = validateInput(employee_id, password);
    if (!inputValidation.success) {
      return res.status(400).json(inputValidation);
    }

    console.log(`🔐 Login attempt: ${employee_id} from IP: ${clientIP}`);

    // 2. Authenticate user
    const authResult = await authenticateUser(employee_id, password, clientIP);
    if (!authResult.success) {
      return res.status(401).json(authResult);
    }

    // 3. Validate location
    const locationResult = await validateLocation(clientIP, authResult.user, employee_id);
    if (!locationResult.success) {
      return res.status(403).json(locationResult);
    }

    // 4. Validate IP address
    const ipResult = await validateIPAddress(clientIP, authResult.user, employee_id, locationResult.location);
    if (!ipResult.success) {
      return res.status(403).json(ipResult);
    }

    // 5. Complete successful login
    const loginResult = await completeLogin(authResult.user, clientIP, locationResult.location, employee_id, startTime);
    return res.status(200).json(loginResult);

  } catch (error) {
    console.error('❌ Login error:', error);
    await logLoginAttempt(null, req.body?.employee_id, getClientIP(req), null, false, 'Server error');
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
}

// Validation Functions
function validateInput(employee_id, password) {
  if (!employee_id || !password) {
    return {
      success: false,
      message: 'Employee ID and password are required'
    };
  }
  return { success: true };
}

async function authenticateUser(employee_id, password, clientIP) {
  // Find user by employee_id
  const { data: user, error: userError } = await supabaseAdmin
    .from('User')
    .select('*')
    .eq('employee_id', employee_id)
    .eq('is_active', true)
    .single();

  if (userError || !user) {
    await logLoginAttempt(null, employee_id, clientIP, null, false, 'Invalid employee ID');
    return {
      success: false,
      message: 'Invalid EmployeeId'
    };
  }

  // Verify password
  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    await logLoginAttempt(user.id, employee_id, clientIP, null, false, 'Invalid password');
    return {
      success: false,
      message: 'Invalid Password'
    };
  }

  return { success: true, user };
}

async function validateLocation(clientIP, user, employee_id) {
  console.log(`📍 Getting location for IP: ${clientIP}`);
  const location = await getLocationFromIP(clientIP);
  
  if (!location) {
    await logLoginAttempt(user.id, employee_id, clientIP, 'Unknown', false, 'Unable to verify location');
    return {
      success: false,
      message: 'Unable to verify your location. Please ensure you have a stable internet connection and try again.'
    };
  }

  console.log(`🌍 Location detected: ${location.country}, ${location.city}`);

  if (!isLocationAllowed(location)) {
    await logLoginAttempt(user.id, employee_id, clientIP, location.country, false, 'Location not allowed');
    return {
      success: false,
      message: `Access denied. Login is only allowed from Dubai or India. Your current location: ${location.country}, ${location.city}`
    };
  }

  return { success: true, location };
}

async function validateIPAddress(clientIP, user, employee_id, location) {
  const { data: allowedIPs, error: ipError } = await supabaseAdmin
    .from('AllowedIP')
    .select('ip_address, description')
    .eq('user_id', user.id)
    .eq('is_active', true);

  if (ipError) {
    console.error('❌ Error fetching allowed IPs:', ipError);
    await logLoginAttempt(user.id, employee_id, clientIP, location.country, false, 'Database error');
    return {
      success: false,
      message: 'Internal server error. Please try again.'
    };
  }

  // Check if IP validation is required
  if (!allowedIPs || allowedIPs.length === 0) {
    console.log(`⚠️ No allowed IPs configured for user ${employee_id}`);
    return { success: true };
  }

  const isIPAllowed = allowedIPs.some(record => record.ip_address === clientIP);
  
  if (!isIPAllowed) {
    await logLoginAttempt(user.id, employee_id, clientIP, location.country, false, 'IP not allowed');
    
    const allowedIPList = allowedIPs.map(ip => `${ip.ip_address} (${ip.description})`).join(', ');
    
    return {
      success: false,
      message: 'Access denied. This device/IP address is not authorized for your account. Please contact your administrator.',
      details: {
        currentIP: clientIP,
        allowedIPs: allowedIPList
      }
    };
  }

  return { success: true };
}

async function completeLogin(user, clientIP, location, employee_id, startTime) {
  // Generate JWT token
  const tokenPayload = {
    userId: user.id,
    employeeId: user.employee_id,
    role: user.role,
    loginTime: new Date().toISOString()
  };

  const token = generateToken(tokenPayload);

  // Update user's last login
  await updateUserLastLogin(user.id);
  
  // Update IP last used time
  await updateIPLastUsed(user.id, clientIP);

  // Log successful login
  await logLoginAttempt(user.id, employee_id, clientIP, location.country, true, null, location);

  const duration = Date.now() - startTime;
  console.log(`✅ Successful login for ${employee_id} in ${duration}ms`);

  return {
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      employee_id: user.employee_id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      last_login: new Date().toISOString()
    },
    location: {
      country: location.country,
      city: location.city
    }
  };
}

// Helper Functions
async function updateUserLastLogin(userId) {
  const { error } = await supabaseAdmin
    .from('User')
    .update({ last_login: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error('❌ Error updating last login:', error);
  }
}

async function updateIPLastUsed(userId, clientIP) {
  const { error } = await supabaseAdmin
    .from('AllowedIP')
    .update({ last_used: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('ip_address', clientIP);

  if (error) {
    console.error('❌ Error updating IP last used:', error);
  }
}

/**
 * Logs login attempt to the database
 */
async function logLoginAttempt(userId, employeeId, ip, country, success, failureReason, location = null) {
  try {
    const logData = {
      user_id: userId,
      employee_id: employeeId,
      ip_address: ip,
      country: country,
      success: success,
      failure_reason: failureReason
    };

    // Add additional location data for successful logins
    if (success && location) {
      logData.city = location.city;
      logData.country_code = location.country_code;
      logData.latitude = location.latitude;
      logData.longitude = location.longitude;
    }

    const { error } = await supabaseAdmin
      .from('LoginLog')
      .insert(logData);

    if (error) {
      console.error('❌ Error logging login attempt:', error);
    } else {
      console.log(`📝 Login attempt logged: ${employeeId} - ${success ? 'SUCCESS' : 'FAILED'}`);
    }
  } catch (error) {
    console.error('❌ Error in logLoginAttempt:', error);
  }
}