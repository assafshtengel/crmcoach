
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // Allow only POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parse the request body
    const requestBody = JSON.parse(event.body);
    const { playerId, playerEmail, userType } = requestBody;
    
    if (!playerId && !playerEmail) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required player identification fields' })
      };
    }

    console.log(`Verifying player session: ID=${playerId || 'not provided'}, Email=${playerEmail || 'not provided'}, UserType=${userType || 'not specified'}`);

    // Create Supabase client with anon key
    const supabaseUrl = 'https://hntgzgrlyfhojcaofbjv.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudGd6Z3JseWZob2pjYW9mYmp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzMjY2NTYsImV4cCI6MjA1NDkwMjY1Nn0.InXLUXMCNHzBYxOEY_97y1Csm_uBeGyUsiNWlAQoHus';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Build the query
    let query = supabase.from('players').select('id, email, full_name, coach_id, password');
    
    // Add filters based on provided parameters
    if (playerId) {
      query = query.eq('id', playerId);
    }
    
    if (playerEmail) {
      if (playerId) {
        // If we have both ID and email, use 'or' condition
        query = query.or(`id.eq.${playerId},email.ilike.${playerEmail.toLowerCase()}`);
      } else {
        // If we only have email, just filter by email
        query = query.ilike('email', playerEmail.toLowerCase());
      }
    }
    
    // Execute the query
    let { data, error } = await query;
      
    if (error) {
      console.log('Database error during player verification:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Database error during verification' })
      };
    }
    
    // If multiple results, prioritize exact ID match
    if (data && data.length > 1 && playerId) {
      data = data.filter(player => player.id === playerId);
    }
    
    // Get the first matching player
    const player = data && data.length > 0 ? data[0] : null;
    
    if (!player) {
      console.log('Player verification failed: No matching player found');
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid player credentials' })
      };
    }
    
    console.log('Player verified successfully:', player.full_name);
    
    // Return success with player data and include user type
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        data: player,
        userType: userType || 'player' // Default to player if not specified
      })
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};
