
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only POST requests are allowed
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        status: 405, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing environment variables");
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log("Starting to process auto video assignments (manual trigger)");
    
    // Call the database function to process auto video assignments
    const { data, error } = await supabase.rpc("process_auto_video_assignments");
    
    if (error) {
      console.error("Error processing auto video assignments:", error);
      throw error;
    }
    
    console.log("Auto video assignments processed successfully");
    
    // Get statistics: how many videos were sent
    const { data: stats, error: statsError } = await supabase
      .from("auto_video_assignments")
      .select("*", { count: "exact" })
      .eq("sent", true)
      .gt("scheduled_for", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      
    if (statsError) {
      console.error("Error fetching stats:", statsError);
    }
    
    const sentInLast24h = stats?.length || 0;
    console.log(`Videos sent in last 24 hours: ${sentInLast24h}`);

    // Get recent assignment history
    const { data: recentAssignments, error: recentError } = await supabase
      .from("auto_video_assignments")
      .select(`
        id, 
        sent, 
        scheduled_for, 
        assigned_at,
        players:player_id (full_name, email),
        videos:video_id (title, days_after_registration)
      `)
      .eq("sent", true)
      .order("scheduled_for", { ascending: false })
      .limit(20);

    if (recentError) {
      console.error("Error fetching recent assignments:", recentError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent_in_last_24h: sentInLast24h,
        recent_assignments: recentAssignments || []
      }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  }
});
