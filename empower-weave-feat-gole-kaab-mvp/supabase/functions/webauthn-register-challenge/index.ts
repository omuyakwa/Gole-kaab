import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { generateRegistrationOptions } from 'https://deno.land/x/simplewebauthn/deno/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabase = createClient(
      req.headers.get('X-Supabase-Url')!,
      req.headers.get('X-Supabase-Anon-Key')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const options = await generateRegistrationOptions({
      rpName: 'Gole Kaab',
      rpID: new URL(req.headers.get('origin')!).hostname,
      userID: user.id,
      userName: user.email!,
      userDisplayName: user.user_metadata.display_name,
      attestationType: 'none',
      excludeCredentials: [], // Here we would list existing credentials for the user
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred',
      },
    })

    // Store the challenge in the user's app_metadata
    await supabase.auth.updateUser({
      data: { webauthn_challenge: options.challenge }
    })

    return new Response(JSON.stringify(options), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
