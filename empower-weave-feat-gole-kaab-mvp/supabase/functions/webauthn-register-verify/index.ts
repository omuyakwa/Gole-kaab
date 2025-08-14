import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { verifyRegistrationResponse } from 'https://deno.land/x/simplewebauthn/deno/server.ts'
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

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: req.headers.get('origin')!,
      expectedRPID: rpID,
      requireUserVerification: true,
    })

    if (verification.verified && verification.registrationInfo) {
      const { credentialPublicKey, credentialID, counter } = verification.registrationInfo

      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )

      await supabaseAdmin.from('webauthn_credentials').insert({
        user_id: user.id,
        credential_id: credentialID,
        public_key: credentialPublicKey,
        counter,
        transports: body.response.transports,
      })
    }

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
