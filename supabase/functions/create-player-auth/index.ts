
// supabase/functions/create-player-auth/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the request body
    const { email, password, firstName, lastName, email_confirm = false } = await req.json()

    // Validate request
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    // Create Supabase admin client using service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Create user using admin API
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm,
      user_metadata: {
        full_name: `${firstName} ${lastName}`,
        role: 'player'  // מגדיר את תפקיד המשתמש כשחקן
      },
    })

    if (userError) {
      console.error('Error creating user:', userError)
      return new Response(
        JSON.stringify({ error: userError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    // בדיקה והוספה לטבלת user_roles אם אין כבר רשומה
    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('id')
        .eq('id', userData.user.id)
        .maybeSingle()

      // אם אין עדיין רשומת תפקיד, נוסיף אחת
      if (!roleData) {
        await supabase
          .from('user_roles')
          .insert({ id: userData.user.id, role: 'player' })
      }
    } catch (roleError) {
      console.error('Warning: Unable to add user role:', roleError)
      // נמשיך גם אם הוספת התפקיד נכשלה
    }

    // Return the user data
    return new Response(
      JSON.stringify({ id: userData.user.id }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )
  }
})
