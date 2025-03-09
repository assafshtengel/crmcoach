
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const ADMIN_EMAIL = "socr.co.il@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AdminMessageRequest {
  message: string;
  userEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userEmail }: AdminMessageRequest = await req.json();

    if (!message || message.trim() === "") {
      throw new Error("Message content cannot be empty");
    }

    if (message.length > 500) {
      throw new Error("Message cannot exceed 500 characters");
    }

    const formattedDate = new Date().toLocaleString("he-IL", {
      timeZone: "Asia/Jerusalem"
    });

    const emailResponse = await resend.emails.send({
      from: "Sports Mental Coach <onboarding@resend.dev>",
      to: [ADMIN_EMAIL],
      subject: "הודעה חדשה מהמערכת",
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
          <h2>הודעה חדשה מהמערכת</h2>
          <p><strong>תאריך:</strong> ${formattedDate}</p>
          <p><strong>שולח:</strong> ${userEmail}</p>
          <p><strong>הודעה:</strong></p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p style="color: #777; margin-top: 20px; font-size: 0.9em;">
            הודעה זו נשלחה באופן אוטומטי ממערכת אימון מנטלי בספורט.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-admin-message function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
