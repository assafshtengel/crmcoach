
// supabase/functions/schedule-session-transitions/index.ts
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

    // First, check if the cron job already exists
    const { data: existingJobs, error: jobsFetchError } = await supabaseClient
      .rpc('cron_job_exists', { job_name: 'check-and-transition-sessions' });
    
    if (jobsFetchError) {
      throw jobsFetchError;
    }

    let result;
    
    // If the cron job doesn't exist, create it
    if (!existingJobs || existingJobs.length === 0) {
      // Set up a cron job to run every minute
      const { data: cronData, error: cronError } = await supabaseClient.rpc(
        'schedule_session_transition_checks',
        {}
      );

      if (cronError) {
        throw cronError;
      }

      result = { created: true, job: cronData };
    } else {
      result = { created: false, message: 'Cron job already exists' };
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error scheduling session transitions:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
