
// supabase/functions/session-transition/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date();
    const currentTime = now.toISOString().split('T')[1].substring(0, 8); // Format: HH:MM:SS
    const currentDate = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    console.log(`Running session transition check at ${currentDate} ${currentTime}`);

    // Get sessions that are starting right now (matching date and time)
    const { data: sessionsToTransition, error: fetchError } = await supabaseClient
      .from('sessions')
      .select('id, session_date, session_time')
      .eq('session_date', currentDate)
      .lt('session_time', currentTime)
      .is('has_started', false);

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${sessionsToTransition?.length || 0} sessions to transition`);

    // Update sessions to mark them as started
    if (sessionsToTransition && sessionsToTransition.length > 0) {
      const sessionIds = sessionsToTransition.map(session => session.id);
      
      const { error: updateError } = await supabaseClient
        .from('sessions')
        .update({ has_started: true })
        .in('id', sessionIds);

      if (updateError) {
        throw updateError;
      }

      console.log(`Successfully transitioned ${sessionIds.length} sessions`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        transitioned: sessionsToTransition?.length || 0,
        timestamp: now.toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in session-transition function:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
