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

// Placeholder logic: flag content containing specific keywords
  const toxicKeywords = ['badword', 'toxic', 'hate', 'spam'];
  const reason = toxicKeywords.find(keyword => text.toLowerCase().includes(keyword));
  if (reason) {
    return { flagged: true, reason: `Contains potentially toxic keyword: ${reason}` };
  }
  return { flagged: false, reason: null };
}

serve(async (req) => {
  try {
    // This function should be triggered by a Supabase Database Webhook on INSERT to the 'comments' table.
    const payload = await req.json();

    // We only care about new comments
    if (payload.type !== 'INSERT' || payload.table !== 'comments') {
      return new Response(JSON.stringify({ message: 'Payload is not a new comment, skipping.' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const comment = payload.record;

    if (!comment || !comment.content) {
      return new Response(JSON.stringify({ message: 'Comment has no content to moderate' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { flagged, reason } = await checkContentModeration(comment.content);

    if (flagged) {
      // If content is flagged, update its status in the database.
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { error } = await supabaseAdmin
        .from('comments')
        .update({ is_flagged: true, moderation_reason: reason })
        .eq('id', comment.id);

      if (error) {
        console.error('Failed to flag comment:', error);
        throw new Error(`Failed to update status for flagged comment: ${error.message}`);
      }

      return new Response(JSON.stringify({ message: `Comment ${comment.id} flagged for review.` }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Comment passed moderation.' }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
})
