
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DailyFormCheck {
  playerId: string;
  playerName: string;
  coachId: string;
  missedDays: number;
  lastSubmissionDate?: string;
}

interface UpcomingGame {
  playerId: string;
  playerName: string;
  gameDate: string;
  opponentTeam: string;
  gameId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action } = await req.json();

    switch (action) {
      case "check_daily_forms":
        return await checkDailyForms(supabase);
      case "send_game_reminders":
        return await sendGameReminders(supabase);
      default:
        return new Response(
          JSON.stringify({ error: "Invalid action specified" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
    }
  } catch (error) {
    console.error("Error processing notification request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Function to check which players haven't submitted daily forms
async function checkDailyForms(supabase) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayFormatted = yesterday.toISOString().split('T')[0];

  // Get all active players with their coaches
  const { data: players, error: playersError } = await supabase
    .from("players")
    .select(`
      id, 
      full_name,
      coach_id,
      coaches (id)
    `)
    .neq("contact_status", "inactive");

  if (playersError) {
    throw new Error(`Error fetching players: ${playersError.message}`);
  }

  // Get players who submitted forms yesterday
  const { data: submissions, error: submissionsError } = await supabase
    .from("player_mental_states")
    .select("player_id, created_at")
    .gte("created_at", `${yesterdayFormatted}T00:00:00`)
    .lt("created_at", `${today.toISOString().split('T')[0]}T00:00:00`);

  if (submissionsError) {
    throw new Error(`Error fetching submissions: ${submissionsError.message}`);
  }

  // Build a set of player IDs who submitted forms
  const submittedPlayerIds = new Set(submissions.map(sub => sub.player_id));

  // Find players who didn't submit forms
  const missingSubmissions: DailyFormCheck[] = [];
  for (const player of players) {
    if (!submittedPlayerIds.has(player.id)) {
      // Get the last submission date for this player
      const { data: lastSubmission } = await supabase
        .from("player_mental_states")
        .select("created_at")
        .eq("player_id", player.id)
        .order("created_at", { ascending: false })
        .limit(1);

      // Calculate how many days since last submission
      let missedDays = 1; // At least missed yesterday
      let lastSubmissionDate = null;
      
      if (lastSubmission && lastSubmission.length > 0) {
        const lastDate = new Date(lastSubmission[0].created_at);
        const diffTime = Math.abs(today.getTime() - lastDate.getTime());
        missedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        lastSubmissionDate = lastSubmission[0].created_at;
      }

      missingSubmissions.push({
        playerId: player.id,
        playerName: player.full_name,
        coachId: player.coach_id,
        missedDays,
        lastSubmissionDate
      });
    }
  }

  // For each player, create a notification
  for (const missing of missingSubmissions) {
    // Notify the player
    await sendPlayerMissingFormNotification(supabase, missing);
    
    // Notify the coach if it's been more than a day
    if (missing.missedDays >= 1) {
      await sendCoachPlayerMissingFormNotification(supabase, missing);
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: `Processed ${missingSubmissions.length} missing form notifications` 
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Function to send game preparation reminders
async function sendGameReminders(supabase) {
  const today = new Date();
  // Get date for 2 days from now
  const upcomingDate = new Date(today);
  upcomingDate.setDate(today.getDate() + 2);
  const upcomingFormatted = upcomingDate.toISOString().split('T')[0];

  // Find upcoming games in the next 2 days
  const { data: upcomingGames, error: gamesError } = await supabase
    .from("player_meetings")
    .select(`
      id,
      player_id,
      meeting_date,
      meeting_type,
      players(full_name)
    `)
    .eq("meeting_type", "game")
    .gte("meeting_date", today.toISOString().split('T')[0])
    .lte("meeting_date", upcomingFormatted);

  if (gamesError) {
    throw new Error(`Error fetching upcoming games: ${gamesError.message}`);
  }

  const gameReminders: UpcomingGame[] = upcomingGames.map(game => ({
    playerId: game.player_id,
    playerName: game.players?.full_name || "Unknown Player",
    gameDate: game.meeting_date,
    opponentTeam: "Upcoming Opponent", // This might need to be added to your schema
    gameId: game.id
  }));

  // Send reminders for each upcoming game
  for (const game of gameReminders) {
    await sendGamePreparationReminder(supabase, game);
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: `Sent ${gameReminders.length} game preparation reminders` 
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Helper function to send notification to player about missing form
async function sendPlayerMissingFormNotification(supabase, missing: DailyFormCheck) {
  // Create a message for the player
  const { error: messageError } = await supabase
    .from("messages")
    .insert({
      sender_id: missing.coachId, // System message as if from coach
      recipient_id: missing.playerId,
      content: `שלום ${missing.playerName}, שמנו לב שלא מילאת את השאלון היומי. אנא מלא אותו בהקדם האפשרי.`,
      is_read: false
    });

  if (messageError) {
    console.error(`Error sending player notification: ${messageError.message}`);
  }
  
  // Log this notification
  await supabase.from("notifications_log").insert({
    coach_id: missing.coachId,
    message_content: `תזכורת למילוי שאלון נשלחה ל${missing.playerName}`,
    status: messageError ? "Error" : "Sent",
    error_message: messageError ? messageError.message : null
  });

  return !messageError;
}

// Helper function to send notification to coach about player missing form
async function sendCoachPlayerMissingFormNotification(supabase, missing: DailyFormCheck) {
  // Create a notification for the coach
  const { error: notificationError } = await supabase
    .from("notifications")
    .insert({
      coach_id: missing.coachId,
      message: `${missing.playerName} לא מילא שאלון יומי כבר ${missing.missedDays} ימים`,
      type: "missing_form",
      is_read: false,
      meta: {
        player_id: missing.playerId,
        player_name: missing.playerName,
        missed_days: missing.missedDays,
        last_submission: missing.lastSubmissionDate
      }
    });

  if (notificationError) {
    console.error(`Error sending coach notification: ${notificationError.message}`);
  }

  return !notificationError;
}

// Helper function to send game preparation reminder
async function sendGamePreparationReminder(supabase, game: UpcomingGame) {
  // Get player's coach ID
  const { data: playerData, error: playerError } = await supabase
    .from("players")
    .select("coach_id")
    .eq("id", game.playerId)
    .single();

  if (playerError) {
    console.error(`Error fetching player coach: ${playerError.message}`);
    return false;
  }

  const coachId = playerData.coach_id;

  // Create a message for the player
  const { error: messageError } = await supabase
    .from("messages")
    .insert({
      sender_id: coachId,
      recipient_id: game.playerId,
      content: `שלום ${game.playerName}, יש לך משחק ב-${game.gameDate}. אנא מלא את שאלון ההכנה למשחק בקישור הבא: /player/game-preparation/${game.gameId}`,
      is_read: false
    });

  if (messageError) {
    console.error(`Error sending game reminder: ${messageError.message}`);
  }
  
  // Log this notification
  await supabase.from("notifications_log").insert({
    coach_id: coachId,
    message_content: `תזכורת למשחק נשלחה ל${game.playerName}`,
    status: messageError ? "Error" : "Sent",
    error_message: messageError ? messageError.message : null
  });

  return !messageError;
}
