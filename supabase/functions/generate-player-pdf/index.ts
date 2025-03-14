
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import * as pdfLib from "https://esm.sh/jspdf@2.5.1";
import { autoTable } from "https://esm.sh/jspdf-autotable@3.5.28";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { playerId, timeRange } = await req.json();

    if (!playerId) {
      return new Response(
        JSON.stringify({ error: "Player ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get player details
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("*")
      .eq("id", playerId)
      .single();

    if (playerError) {
      return new Response(
        JSON.stringify({ error: `Error fetching player: ${playerError.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Get mental states within time range
    const startDate = getStartDateForRange(timeRange);
    const { data: mentalStates, error: mentalStatesError } = await supabase
      .from("player_mental_states")
      .select("*")
      .eq("player_id", playerId)
      .gte("created_at", startDate)
      .order("created_at", { ascending: false });

    if (mentalStatesError) {
      return new Response(
        JSON.stringify({ error: `Error fetching mental states: ${mentalStatesError.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Get game summaries within time range
    const { data: gameSummaries, error: gameSummariesError } = await supabase
      .from("game_summaries")
      .select("*")
      .eq("player_id", playerId)
      .gte("created_at", startDate)
      .order("created_at", { ascending: false });

    if (gameSummariesError) {
      return new Response(
        JSON.stringify({ error: `Error fetching game summaries: ${gameSummariesError.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Get session summaries within time range
    const { data: sessionSummaries, error: sessionSummariesError } = await supabase
      .from("session_summaries")
      .select("*")
      .eq("player_id", playerId)
      .gte("created_at", startDate)
      .order("created_at", { ascending: false });

    if (sessionSummariesError) {
      return new Response(
        JSON.stringify({ error: `Error fetching session summaries: ${sessionSummariesError.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Generate PDF
    const pdfBase64 = await generatePlayerPDF(player, mentalStates, gameSummaries, sessionSummaries, timeRange);

    return new Response(
      JSON.stringify({ 
        success: true, 
        pdfBase64,
        fileName: `${player.full_name}_report_${new Date().toISOString().split('T')[0]}.pdf`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating PDF:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

function getStartDateForRange(timeRange) {
  const now = new Date();
  switch (timeRange) {
    case "7days":
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return sevenDaysAgo.toISOString();
    case "30days":
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return thirtyDaysAgo.toISOString();
    case "90days":
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(now.getDate() - 90);
      return ninetyDaysAgo.toISOString();
    case "season":
      const seasonStart = new Date();
      seasonStart.setMonth(7); // August (0-indexed)
      seasonStart.setDate(1);
      if (now.getMonth() < 7) {
        seasonStart.setFullYear(now.getFullYear() - 1);
      }
      return seasonStart.toISOString();
    default:
      const defaultDate = new Date();
      defaultDate.setDate(now.getDate() - 30);
      return defaultDate.toISOString();
  }
}

async function generatePlayerPDF(player, mentalStates, gameSummaries, sessionSummaries, timeRange) {
  // Create a new PDF document
  const jsPDF = pdfLib.jsPDF;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  // Set RTL mode for Hebrew
  doc.setR2L(true);

  // Add title
  doc.setFontSize(22);
  doc.text(`דוח שחקן: ${player.full_name}`, doc.internal.pageSize.width / 2, 20, { align: "center" });
  
  // Add date range
  doc.setFontSize(12);
  let dateRangeText = "טווח תאריכים: ";
  switch (timeRange) {
    case "7days": dateRangeText += "7 ימים אחרונים"; break;
    case "30days": dateRangeText += "30 ימים אחרונים"; break;
    case "90days": dateRangeText += "90 ימים אחרונים"; break;
    case "season": dateRangeText += "עונה נוכחית"; break;
    default: dateRangeText += "30 ימים אחרונים";
  }
  doc.text(dateRangeText, doc.internal.pageSize.width / 2, 30, { align: "center" });

  // Add player details
  doc.setFontSize(14);
  doc.text("פרטי שחקן", 20, 45);
  doc.setFontSize(10);
  doc.text(`שם מלא: ${player.full_name}`, 20, 55);
  doc.text(`דוא"ל: ${player.email || "לא צוין"}`, 20, 60);
  doc.text(`טלפון: ${player.phone || "לא צוין"}`, 20, 65);
  doc.text(`מועדון: ${player.club || "לא צוין"}`, 20, 70);
  doc.text(`תחום ספורט: ${player.sport_field || "לא צוין"}`, 20, 75);
  doc.text(`עיר: ${player.city || "לא צוין"}`, 20, 80);

  // Add mental states summary
  if (mentalStates && mentalStates.length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.text("סיכום מצבים מנטליים", 20, 20);

    // Calculate averages
    const feelingSum = mentalStates.reduce((sum, state) => sum + state.feeling_score, 0);
    const motivationSum = mentalStates.reduce((sum, state) => sum + state.motivation_level, 0);
    const fatigueSum = mentalStates.reduce((sum, state) => sum + state.mental_fatigue_level, 0);
    const avgFeeling = (feelingSum / mentalStates.length).toFixed(1);
    const avgMotivation = (motivationSum / mentalStates.length).toFixed(1);
    const avgFatigue = (fatigueSum / mentalStates.length).toFixed(1);

    doc.setFontSize(12);
    doc.text(`ממוצע תחושה: ${avgFeeling}/10`, 20, 30);
    doc.text(`ממוצע מוטיבציה: ${avgMotivation}/10`, 20, 35);
    doc.text(`ממוצע עייפות מנטלית: ${avgFatigue}/10`, 20, 40);
    doc.text(`מספר רשומות: ${mentalStates.length}`, 20, 45);

    // Create table of recent mental states
    const tableData = mentalStates.slice(0, 10).map(state => [
      new Date(state.created_at).toLocaleDateString('he-IL'),
      state.feeling_score.toString(),
      state.motivation_level.toString(),
      state.mental_fatigue_level.toString(),
      state.improvement_focus || "לא צוין",
      state.has_concerns ? "כן" : "לא"
    ]);

    autoTable(doc, {
      startY: 55,
      head: [["תאריך", "תחושה", "מוטיבציה", "עייפות", "תחום לשיפור", "דאגות"]],
      body: tableData,
      theme: 'grid',
      headStyles: { halign: 'center', fillColor: [100, 100, 255] },
      styles: { halign: 'center', font: 'arial' },
      margin: { top: 55 }
    });
  }

  // Add game summaries
  if (gameSummaries && gameSummaries.length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.text("סיכומי משחקים", 20, 20);

    // Create table of game summaries
    const tableData = gameSummaries.map(game => [
      new Date(game.game_date).toLocaleDateString('he-IL'),
      game.opponent_team || "לא צוין",
      game.performance_rating ? `${game.performance_rating}/10` : "לא צוין",
      game.concentration_level ? `${game.concentration_level}/10` : "לא צוין",
      game.fatigue_level ? `${game.fatigue_level}/10` : "לא צוין",
      game.goals_met ? "כן" : "לא",
      game.strongest_point || "לא צוין"
    ]);

    autoTable(doc, {
      startY: 30,
      head: [["תאריך", "יריב", "ביצוע", "ריכוז", "עייפות", "מטרות הושגו", "נקודה חזקה"]],
      body: tableData,
      theme: 'grid',
      headStyles: { halign: 'center', fillColor: [100, 100, 255] },
      styles: { halign: 'center', font: 'arial' },
      margin: { top: 30 }
    });
  }

  // Add session summaries
  if (sessionSummaries && sessionSummaries.length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.text("סיכומי מפגשים", 20, 20);

    // Create table of session summaries
    const tableData = sessionSummaries.map(session => [
      new Date(session.created_at).toLocaleDateString('he-IL'),
      session.summary_text ? (session.summary_text.length > 30 ? session.summary_text.substring(0, 30) + "..." : session.summary_text) : "לא צוין",
      session.progress_rating ? `${session.progress_rating}/10` : "לא צוין",
      session.achieved_goals ? session.achieved_goals.join(", ") : "אין",
      session.future_goals ? session.future_goals.join(", ") : "אין",
      session.next_session_focus || "לא צוין"
    ]);

    autoTable(doc, {
      startY: 30,
      head: [["תאריך", "סיכום", "התקדמות", "מטרות שהושגו", "מטרות עתידיות", "פוקוס למפגש הבא"]],
      body: tableData,
      theme: 'grid',
      headStyles: { halign: 'center', fillColor: [100, 100, 255] },
      styles: { halign: 'center', font: 'arial' },
      margin: { top: 30 }
    });
  }

  // Add final note and date
  doc.addPage();
  doc.setFontSize(14);
  doc.text("הערות סיכום", 20, 20);
  doc.setFontSize(10);
  doc.text("דוח זה מציג סיכום של הנתונים המנטליים והמקצועיים של השחקן בתקופה המוגדרת.", 20, 30);
  doc.text("הנתונים משקפים את התקדמות השחקן ואת המצב המנטלי שלו לאורך זמן.", 20, 35);
  doc.text("יש להתייחס לנתונים אלו כחלק מתמונה רחבה יותר של התפתחות השחקן.", 20, 40);
  doc.text(`דוח זה הופק באופן אוטומטי בתאריך ${new Date().toLocaleDateString('he-IL')}`, 20, 50);

  // Convert the PDF to base64
  const pdfBase64 = doc.output('datauristring');
  return pdfBase64;
}
