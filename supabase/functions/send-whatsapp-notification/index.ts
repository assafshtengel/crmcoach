
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.3';
import { Twilio } from 'https://esm.sh/twilio@4.19.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id, phone_number, message } = await req.json();

    // Initialize Twilio client with environment variables
    const twilioClient = new Twilio(
      Deno.env.get('TWILIO_ACCOUNT_SID'),
      Deno.env.get('TWILIO_AUTH_TOKEN')
    );

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Send WhatsApp message
    const whatsappResult = await twilioClient.messages.create({
      from: `whatsapp:${Deno.env.get('TWILIO_PHONE_NUMBER')}`,
      to: `whatsapp:${phone_number}`,
      body: message,
    });

    // Log the notification
    const { error: logError } = await supabaseClient
      .from('notifications_log')
      .insert({
        session_id,
        message_content: message,
        status: whatsappResult.status === 'sent' ? 'Sent' : 'Failed',
        error_message: whatsappResult.errorMessage,
        sent_at: new Date().toISOString(),
      });

    if (logError) throw logError;

    // Update session reminder status
    const { error: updateError } = await supabaseClient
      .from('sessions')
      .update({ reminder_sent: true })
      .eq('id', session_id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, messageId: whatsappResult.sid }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
