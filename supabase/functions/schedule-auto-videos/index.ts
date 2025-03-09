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

  // Allow only POST requests and scheduled cron invocations
  const isScheduledInvocation = req.headers.get("Authorization")?.includes("Bearer");
  
  if (req.method !== "POST" && !isScheduledInvocation) {
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
    console.log("Starting scheduled auto video processing");
    
    // Check for assignments with NULL scheduled_for dates
    // This should not happen anymore due to the database trigger update and NOT NULL constraint,
    // but we'll keep this as an additional safety check
    const { data: nullAssignments, error: nullError } = await supabase
      .from("auto_video_assignments")
      .select("id, player_id, video_id, created_at")
      .is("scheduled_for", null);
      
    if (nullError) {
      console.error("Error fetching assignments with null scheduled_for dates:", nullError);
    } else if (nullAssignments && nullAssignments.length > 0) {
      console.log(`Found ${nullAssignments.length} assignments with null scheduled_for dates, fixing...`);
      
      for (const assignment of nullAssignments) {
        try {
          // Get video details to determine days_after_registration
          const { data: videoData, error: videoError } = await supabase
            .from("videos")
            .select("days_after_registration")
            .eq("id", assignment.video_id)
            .single();
            
          if (videoError) {
            console.error(`Error getting video data for ${assignment.video_id}:`, videoError);
            continue;
          }
          
          // Get player registration date
          const { data: playerData, error: playerError } = await supabase
            .from("players")
            .select("created_at")
            .eq("id", assignment.player_id)
            .single();
            
          if (playerError) {
            console.error(`Error getting player data for ${assignment.player_id}:`, playerError);
            continue;
          }
          
          const daysAfter = videoData.days_after_registration || 1; // Default to 1 day if not set
          const playerCreatedAt = new Date(playerData.created_at);
          const scheduledDate = new Date(playerCreatedAt);
          scheduledDate.setDate(scheduledDate.getDate() + daysAfter);
          
          // Update the assignment with the calculated scheduled_for date
          const { error: updateError } = await supabase
            .from("auto_video_assignments")
            .update({ scheduled_for: scheduledDate.toISOString() })
            .eq("id", assignment.id);
            
          if (updateError) {
            console.error(`Error updating assignment ${assignment.id}:`, updateError);
          } else {
            console.log(`Fixed scheduled_for date for assignment ${assignment.id}`);
          }
        } catch (err) {
          console.error(`Unexpected error processing assignment ${assignment.id}:`, err);
        }
      }
    } else {
      console.log("No assignments with NULL scheduled_for dates found - that's good!");
    }
    
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

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Scheduled auto video processing completed successfully",
        sent_in_last_24h: sentInLast24h,
        fixed_null_dates: nullAssignments?.length || 0
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
    console.error("Error in scheduled auto video processing:", error);
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
