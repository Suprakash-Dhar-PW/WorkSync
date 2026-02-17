
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Authorization check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user: manager }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !manager) {
      throw new Error('Unauthorized')
    }

    // Parse request body
    const { email, name, password } = await req.json()
    if (!email) {
      throw new Error('Email is required')
    }

    console.log(`Manager ${manager.email} inviting ${email}`)
    
    let invitedUser;
    let inviteError;

    if (password) {
       // Create user directly with password (useful for testing/demo)
       const result = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { name, role: 'employee' }
       })
       invitedUser = result.data;
       inviteError = result.error;
    } else {
       // Invite user via email
       const result = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
          data: { name, role: 'employee' }
       })
       invitedUser = result; // inviteUserByEmail returns { data: { user: User, ... }, error }
       if (result.data) invitedUser = result.data; // normalize structure
       inviteError = result.error;
    }

    if (inviteError) throw inviteError
    if (!invitedUser || !invitedUser.user) throw new Error('Failed to create/invite user')

    const employeeId = invitedUser.user.id

    // Link manager and employee
    const { data: existingLink, error: linkQueryError } = await supabaseAdmin
      .from('manager_employees')
      .select('id')
      .eq('manager_id', manager.id)
      .eq('employee_id', employeeId)
      .maybeSingle()

    if (linkQueryError) {
      console.error('Link query error:', linkQueryError)
      throw linkQueryError
    }

    if (!existingLink) {
      const { error: insertError } = await supabaseAdmin
        .from('manager_employees')
        .insert({
          manager_id: manager.id,
          employee_id: employeeId,
          invited_at: new Date().toISOString()
        })
      
      if (insertError) {
        console.error('Link insert error:', insertError)
        throw insertError
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Invitation sent successfully', 
        user: invitedUser.user 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
