
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { coachId } = await req.json();

    if (!coachId) {
      throw new Error("Missing coach ID");
    }

    // Initialize Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Get coach details
    const { data: coachData, error: coachError } = await supabaseAdmin
      .from("coaches")
      .select("*")
      .eq("id", coachId)
      .single();

    if (coachError || !coachData) {
      console.error("Error fetching coach data:", coachError);
      throw new Error("Failed to fetch coach data");
    }

    // Send the email notification
    const emailResponse = await resend.emails.send({
      from: "Coach Platform <noreply@resend.dev>",
      to: ["socr.co.il@gmail.com"],
      subject: "New Coach Registration Notification",
      html: `
        <h1>New Coach Registration</h1>
        <p>A new coach has registered in the system:</p>
        <ul>
          <li><strong>Name:</strong> ${coachData.full_name || "Not provided"}</li>
          <li><strong>Email:</strong> ${coachData.email || "Not provided"}</li>
          <li><strong>Specialty:</strong> ${coachData.specialty || "Not provided"}</li>
          <li><strong>Phone:</strong> ${coachData.phone || "Not provided"}</li>
          <li><strong>Registration Time:</strong> ${new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" })}</li>
        </ul>
        <p>You can review this coach's details in the admin dashboard.</p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Email notification sent successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in notify-new-coach function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
