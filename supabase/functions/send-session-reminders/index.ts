
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Session {
  id: string;
  session_date: string;
  session_time: string;
  reminder_sent: boolean;
  player: {
    full_name: string;
    phone: string;
  };
  coach: {
    full_name: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get upcoming sessions in the next 24 hours where reminder hasn't been sent
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const { data: sessions, error: sessionsError } = await supabaseClient
      .from('sessions')
      .select(`
        id,
        session_date,
        session_time,
        reminder_sent,
        player:players(full_name, phone),
        coach:coaches(full_name)
      `)
      .eq('reminder_sent', false)
      .gte('session_date', now.toISOString().split('T')[0])
      .lte('session_date', tomorrow.toISOString().split('T')[0]);

    if (sessionsError) {
      throw sessionsError;
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !twilioNumber) {
      throw new Error('Missing Twilio configuration');
    }

    const results = [];

    for (const session of (sessions as Session[])) {
      try {
        // Format message
        const message = `שלום ${session.player.full_name}, תזכורת למפגש שלך עם המאמן ${session.coach.full_name} בתאריך ${session.session_date} בשעה ${session.session_time}. נא להגיע בזמן!`;

        // Send WhatsApp message via Twilio
        const twilioResponse = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
            },
            body: new URLSearchParams({
              From: `whatsapp:${twilioNumber}`,
              To: `whatsapp:${session.player.phone}`,
              Body: message,
            }),
          }
        );

        const twilioData = await twilioResponse.json();

        // Log the notification
        await supabaseClient
          .from('notifications_log')
          .insert({
            session_id: session.id,
            status: twilioResponse.ok ? 'success' : 'error',
            message_content: message,
            error_message: twilioResponse.ok ? null : JSON.stringify(twilioData),
          });

        // Update session reminder status
        if (twilioResponse.ok) {
          await supabaseClient
            .from('sessions')
            .update({ reminder_sent: true })
            .eq('id', session.id);
        }

        results.push({
          sessionId: session.id,
          status: twilioResponse.ok ? 'success' : 'error',
          message: twilioResponse.ok ? 'Reminder sent successfully' : 'Failed to send reminder',
        });

      } catch (error) {
        console.error(`Error processing session ${session.id}:`, error);
        
        results.push({
          sessionId: session.id,
          status: 'error',
          message: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in send-session-reminders:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
