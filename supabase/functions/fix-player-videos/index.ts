
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
    console.log("Starting to fix player videos");
    let fixedPlayerVideos = 0;
    let fixedNullSent = 0;
    let processedPastDue = 0;
    
    // Fix auto_video_assignments with NULL sent values
    const { data: nullSentAssignments, error: nullSentError } = await supabase
      .from("auto_video_assignments")
      .select("id")
      .is("sent", null);
      
    if (nullSentError) {
      console.error("Error fetching null sent assignments:", nullSentError);
    } else if (nullSentAssignments && nullSentAssignments.length > 0) {
      fixedNullSent = nullSentAssignments.length;
      console.log(`Found ${fixedNullSent} assignments with null sent values, fixing...`);
      
      const { error: updateError } = await supabase
        .from("auto_video_assignments")
        .update({ sent: false })
        .is("sent", null);
        
      if (updateError) {
        console.error("Error updating null sent assignments:", updateError);
      }
    }
    
    // Process past due auto video assignments
    const { data: pastDueAssignments, error: pastDueError } = await supabase
      .from("auto_video_assignments")
      .select("*")
      .eq("sent", false)
      .lt("scheduled_for", new Date().toISOString());
      
    if (pastDueError) {
      console.error("Error fetching past due assignments:", pastDueError);
    } else if (pastDueAssignments && pastDueAssignments.length > 0) {
      processedPastDue = pastDueAssignments.length;
      console.log(`Found ${processedPastDue} past due assignments, processing...`);
      
      // Process each past due assignment
      for (const assignment of pastDueAssignments) {
        // Get the coach ID for the player
        const { data: playerData, error: playerError } = await supabase
          .from("players")
          .select("coach_id")
          .eq("id", assignment.player_id)
          .single();
          
        if (playerError) {
          console.error(`Error getting coach ID for player ${assignment.player_id}:`, playerError);
          continue;
        }
        
        // Create player_videos entry if it doesn't exist
        const { data: existingEntry, error: checkError } = await supabase
          .from("player_videos")
          .select("id")
          .eq("player_id", assignment.player_id)
          .eq("video_id", assignment.video_id)
          .maybeSingle();
          
        if (checkError) {
          console.error("Error checking existing player_videos entry:", checkError);
          continue;
        }
        
        if (!existingEntry) {
          // Create new player_videos entry
          const { error: insertError } = await supabase
            .from("player_videos")
            .insert({
              player_id: assignment.player_id,
              video_id: assignment.video_id,
              assigned_by: playerData.coach_id,
              watched: false
            });
            
          if (insertError) {
            console.error("Error creating player_videos entry:", insertError);
          } else {
            fixedPlayerVideos++;
            
            // Update video count for player
            const { error: incrementError } = await supabase.rpc(
              "increment_player_video_count",
              { player_id_param: assignment.player_id }
            );
            
            if (incrementError) {
              console.error("Error incrementing player video count:", incrementError);
            }
          }
        }
        
        // Mark auto assignment as sent
        const { error: updateError } = await supabase
          .from("auto_video_assignments")
          .update({ sent: true })
          .eq("id", assignment.id);
          
        if (updateError) {
          console.error("Error updating auto assignment:", updateError);
        }
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        fixed_player_videos: fixedPlayerVideos,
        fixed_null_sent: fixedNullSent,
        processed_past_due: processedPastDue
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
    console.error("Error fixing player videos:", error);
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
