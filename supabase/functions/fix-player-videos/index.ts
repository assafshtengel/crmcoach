
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
    
    // First, get all player_videos entries
    const { data: playerVideos, error: pvError } = await supabase
      .from("player_videos")
      .select("id, player_id, video_id, watched, watched_at")
      .is("watched", null);
      
    if (pvError) {
      console.error("Error fetching player_videos:", pvError);
      throw pvError;
    }
    
    console.log(`Found ${playerVideos?.length || 0} player videos to fix`);
    
    let fixedCount = 0;
    
    if (playerVideos && playerVideos.length > 0) {
      for (const pv of playerVideos) {
        try {
          // Update the player_video entry to set watched = false
          const { error: updateError } = await supabase
            .from("player_videos")
            .update({ watched: false })
            .eq("id", pv.id);
            
          if (updateError) {
            console.error(`Error updating player_video ${pv.id}:`, updateError);
          } else {
            fixedCount++;
          }
        } catch (err) {
          console.error(`Error processing player_video ${pv.id}:`, err);
        }
      }
    }
    
    console.log(`Fixed ${fixedCount} player videos`);
    
    // Check for auto_video_assignments with null sent values
    const { data: nullAssignments, error: nullError } = await supabase
      .from("auto_video_assignments")
      .select("id, player_id, video_id, scheduled_for")
      .is("sent", null);
      
    if (nullError) {
      console.error("Error fetching null sent assignments:", nullError);
    } else {
      console.log(`Found ${nullAssignments?.length || 0} auto assignments with null sent values`);
      
      let fixedSentCount = 0;
      
      if (nullAssignments && nullAssignments.length > 0) {
        for (const assignment of nullAssignments) {
          try {
            // Update the assignment to set sent = false
            const { error: updateError } = await supabase
              .from("auto_video_assignments")
              .update({ sent: false })
              .eq("id", assignment.id);
              
            if (updateError) {
              console.error(`Error updating assignment ${assignment.id}:`, updateError);
            } else {
              fixedSentCount++;
            }
          } catch (err) {
            console.error(`Error processing assignment ${assignment.id}:`, err);
          }
        }
      }
      
      console.log(`Fixed ${fixedSentCount} auto assignments with null sent values`);
    }
    
    // Check for auto_video_assignments past their scheduled date but not sent
    const { data: pastDueAssignments, error: pastDueError } = await supabase
      .from("auto_video_assignments")
      .select("id, player_id, video_id, scheduled_for")
      .eq("sent", false)
      .lt("scheduled_for", new Date().toISOString());
      
    if (pastDueError) {
      console.error("Error fetching past due assignments:", pastDueError);
    } else {
      console.log(`Found ${pastDueAssignments?.length || 0} past due assignments`);
      
      let processedCount = 0;
      
      if (pastDueAssignments && pastDueAssignments.length > 0) {
        for (const assignment of pastDueAssignments) {
          try {
            // Create player_videos entry
            const { error: insertError } = await supabase
              .from("player_videos")
              .insert({
                player_id: assignment.player_id,
                video_id: assignment.video_id,
                watched: false,
                assigned_by: await getCoachIdForPlayer(supabase, assignment.player_id)
              });
              
            if (insertError) {
              if (insertError.code === "23505") { // Unique violation
                console.log(`Player video already exists for assignment ${assignment.id}`);
              } else {
                console.error(`Error creating player_video for assignment ${assignment.id}:`, insertError);
                continue;
              }
            }
            
            // Mark the assignment as sent
            const { error: updateError } = await supabase
              .from("auto_video_assignments")
              .update({ sent: true })
              .eq("id", assignment.id);
              
            if (updateError) {
              console.error(`Error updating assignment ${assignment.id}:`, updateError);
            } else {
              processedCount++;
            }
          } catch (err) {
            console.error(`Error processing assignment ${assignment.id}:`, err);
          }
        }
      }
      
      console.log(`Processed ${processedCount} past due assignments`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        fixed_player_videos: fixedCount,
        fixed_null_sent: fixedSentCount || 0,
        processed_past_due: processedCount || 0
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

async function getCoachIdForPlayer(supabase: any, playerId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("players")
      .select("coach_id")
      .eq("id", playerId)
      .single();
      
    if (error) {
      console.error("Error fetching coach ID for player:", error);
      return null;
    }
    
    return data?.coach_id || null;
  } catch (err) {
    console.error("Error in getCoachIdForPlayer:", err);
    return null;
  }
}
