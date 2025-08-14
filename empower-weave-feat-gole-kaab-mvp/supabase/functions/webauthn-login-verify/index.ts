import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { verifyAuthenticationResponse } from 'https://deno.land/x/simplewebauthn/deno/server.ts'
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

    const body = await req.json()
    const rpID = new URL(req.headers.get('origin')!).hostname
    const expectedChallenge = user.app_metadata.webauthn_challenge

    // Get the authenticator from the database
    const { data: authenticator, error } = await supabase
      .from('webauthn_credentials')
      .select('*')
      .eq('credential_id', body.id)
      .single()

    if (error || !authenticator) throw new Error('Authenticator not found')

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: req.headers.get('origin')!,
      expectedRPID: rpID,
      authenticator,
      requireUserVerification: true,
    })

    if (verification.verified) {
      // Update the counter
      await supabase.from('webauthn_credentials').update({
        counter: verification.authenticationInfo.newCounter
      }).eq('id', authenticator.id)
    }

    // In a real app, you would now issue a session JWT.
    // For this MVP, we'll just return verification status.
    return new Response(JSON.stringify({ verified: verification.verified }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
