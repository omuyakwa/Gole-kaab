import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// This is a placeholder for a real moderation service API call.
// In a real application, you would use a service like OpenAI's Moderation API,
// Perspective API, etc.
async function checkContentModeration(text: string) {
  console.log(`Checking moderation for: "${text}"`);
  // const apiKey = Deno.env.get('MODERATION_API_KEY');
  // const response = await fetch(`https://api.moderation-service.com/check`, { ... });
  // const result = await response.json();
  // return result.is_flagged; // e.g., returns true if toxic

  // Placeholder logic: flag content containing "toxic"
  if (text.toLowerCase().includes('toxic')) {
    return true;
  }
  return false;
}

serve(async (req) => {
  try {
    // This function is designed to be triggered by a Supabase Database Webhook.
    const payload = await req.json();
    const record = payload.record; // The new row data

    // Ensure we have content to moderate
    if (!record || !record.content) {
      return new Response(JSON.stringify({ message: 'No content to moderate' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const isFlagged = await checkContentModeration(record.content);

    if (isFlagged) {
      // If content is flagged, update its status in the database.
      // This requires the Supabase URL and a service_role key,
      // which should be set as environment variables in the Edge Function settings.
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const tableName = payload.table === 'posts' ? 'posts' : 'comments';

      const { error } = await supabaseAdmin
        .from(tableName)
        .update({ status: 'pending_review' })
        .eq('id', record.id);

      if (error) {
        throw new Error(`Failed to update status for flagged content: ${error.message}`);
      }

      return new Response(JSON.stringify({ message: `Content ${record.id} flagged for review.` }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Content passed moderation.' }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
})
