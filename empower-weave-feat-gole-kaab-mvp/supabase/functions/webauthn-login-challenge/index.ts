import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { generateAuthenticationOptions } from 'https://deno.land/x/simplewebauthn/deno/server.ts'
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

    const options = await generateAuthenticationOptions({
      allowCredentials: [], // Here we would list existing credentials for the user
      userVerification: 'preferred',
    })

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
