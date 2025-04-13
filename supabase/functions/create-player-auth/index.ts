
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("Edge Function: create-player-auth started executing");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Parsing request body...");
    const { email, password, firstName, lastName, playerData } = await req.json();
    
    // Log request information (excluding sensitive data)
    console.log(`Request received for email: ${email}`);
    console.log(`Additional data received: firstName=${!!firstName}, lastName=${!!lastName}, playerData=${!!playerData}`);
    
    // Validate required fields
    if (!email || !password) {
      console.error("Validation error: Missing required fields");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email and password are required fields",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Create supabase admin client with service role
    console.log("Initializing Supabase admin client...");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Environment variables not properly configured");
      throw new Error("Server configuration error: missing required environment variables");
    }
    
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    // Create the user in Supabase Auth
    console.log("Attempting to create user in Supabase Auth...");
    const { data: userData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: firstName && lastName ? `${firstName} ${lastName}` : undefined
      }
    });
    
    if (createUserError) {
      console.error("Error creating auth user:", createUserError);
      return new Response(
        JSON.stringify({
          success: false,
          error: createUserError.message,
          code: createUserError.code || "auth_error"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Log successful user creation
    console.log(`User created successfully with ID: ${userData.user.id}`);
    
    // If user created successfully, return the user id to be used for player creation
    return new Response(
      JSON.stringify({
        success: true,
        id: userData.user.id,
        email: userData.user.email
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Unexpected error in create-player-auth:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
