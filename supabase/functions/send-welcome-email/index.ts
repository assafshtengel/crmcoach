
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface EmailPayload {
  email: string
  password: string
  playerName: string
  coachName: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: EmailPayload = await req.json()
    const { email, password, playerName, coachName } = payload

    // יצירת לקוח Supabase עם מפתח השירות
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // שליחת האימייל דרך הטמפלייט של Supabase
    const { error } = await supabaseClient.auth.admin.inviteUserByEmail(email, {
      data: {
        temporary_password: password,
        player_name: playerName,
        coach_name: coachName,
      },
      redirectTo: `${Deno.env.get('SITE_URL')}/auth`
    })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ message: 'Welcome email sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
