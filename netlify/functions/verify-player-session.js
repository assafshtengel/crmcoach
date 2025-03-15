
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // Allow only POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parse the request body
    const { playerId, playerEmail } = JSON.parse(event.body);
    
    if (!playerId || !playerEmail) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    console.log(`Verifying player session: ID=${playerId}, Email=${playerEmail}`);

    // Create Supabase client with anon key
    const supabaseUrl = 'https://hntgzgrlyfhojcaofbjv.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudGd6Z3JseWZob2pjYW9mYmp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzMjY2NTYsImV4cCI6MjA1NDkwMjY1Nn0.InXLUXMCNHzBYxOEY_97y1Csm_uBeGyUsiNWlAQoHus';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Query the database to verify the player
    const { data, error } = await supabase
      .from('players')
      .select('id, email, full_name')
      .ilike('email', playerEmail.toLowerCase())
      .eq('id', playerId)
      .single();
      
    if (error) {
      console.log('Database error during player verification:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Database error during verification' })
      };
    }
    
    if (!data) {
      console.log('Player verification failed: No matching player found');
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid player credentials' })
      };
    }
    
    console.log('Player verified successfully:', data.full_name);
    
    // Return success with player data
    return {
      statusCode: 200,
      body: JSON.stringify({ data })
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};
