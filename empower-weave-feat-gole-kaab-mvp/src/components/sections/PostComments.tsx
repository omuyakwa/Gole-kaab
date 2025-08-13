import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getComments, createComment } from '@/integrations/supabase/api';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Heart, Reply, Languages, Bot } from 'lucide-react';

interface PostCommentsProps {
  postId: string;
}

interface CommentWithTranslation extends Comment {
  translatedContent?: string;
  isTranslated?: boolean;
}

export const PostComments = ({ postId }: PostCommentsProps) => {
  const [replyContent, setReplyContent] = useState('');
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [translatedComments, setTranslatedComments] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState<Record<string, boolean>>({});
  const [revealedComments, setRevealedComments] = useState<Record<string, boolean>>({});
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const { data: comments, isLoading, error } = useQuery<CommentWithTranslation[]>({
    queryKey: ['comments', postId],
    queryFn: () => getComments(postId),
    enabled: !!postId,
  });

  const createCommentMutation = useMutation({
    mutationFn: (newComment: { content: string; postId: string; userId: string; }) =>
      createComment(newComment.content, newComment.postId, newComment.userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] }); // Also invalidate posts to update comment count
      setReplyContent('');
      toast({ title: "Reply posted!" });
    },
    onError: (error) => {
      toast({ title: "Error posting reply", description: error.message, variant: "destructive" });
    },
  });

  const handleSuggestReply = async () => {
    if (!replyContent.trim()) {
      toast({ title: "Write something first!", description: "AI suggestions work best with some context."});
      return;
    }
    setIsSuggesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-reply', {
        body: { text: replyContent },
      });
      if (error) throw error;
      setSuggestions(data.suggestions);
    } catch (error: any) {
      toast({ title: "Suggestion failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleReplySubmit = () => {
    if (replyContent.trim() && user) {
      createCommentMutation.mutate({ content: replyContent, postId, userId: user.id });
      setSuggestions([]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-4 text-destructive">Error loading comments.</div>;
  }

  return (
    <div className="border-t border-border pt-4 space-y-3">
      {comments && comments.length > 0 ? (
        comments.map((comment) => (
          <div key={comment.id} className="flex space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                {comment.author.display_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 p-3 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium text-foreground">
                {comment.author.display_name || 'Anonymous'}
              </p>

              {comment.is_flagged && !revealedComments[comment.id] ? (
                <div className="text-sm text-muted-foreground mt-1 italic p-2 bg-destructive/10 rounded-md">
                  <p>This comment has been flagged for review.</p>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-xs"
                    onClick={() => setRevealedComments(prev => ({ ...prev, [comment.id]: true }))}
                  >
                    Show comment
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  {translatedComments[comment.id] || comment.content}
                </p>
              )}

              <div className="flex items-center space-x-2 mt-2">
                <Button variant="ghost" size="sm" className="text-xs">
                  <Heart className="w-3 h-3 mr-1" />
                  {comment.likes}
                </Button>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setReplyContent(prev => `${prev}@${comment.author.display_name} `)}>
                  <Reply className="w-3 h-3 mr-1" />
                  Reply
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleTranslate(comment.id, comment.content)}
                  disabled={isTranslating[comment.id]}
                >
                  {isTranslating[comment.id] ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Languages className="w-3 h-3 mr-1" />
                  )}
                  {translatedComments[comment.id] ? 'Original' : 'Translate'}
                </Button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-sm text-muted-foreground py-4">
          No comments yet. Be the first to reply!
        </p>
      )}

      {/* Reply Form */}
      {user && (
        <div className="flex space-x-3 pt-4">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-accent text-accent-foreground text-xs">
              {user.user_metadata.display_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="mb-2"
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleReplySubmit}
                disabled={!replyContent.trim() || createCommentMutation.isPending}
              >
                {createCommentMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Post Reply
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSuggestReply}
                disabled={isSuggesting}
              >
                {isSuggesting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Bot className="w-4 h-4 mr-2" />
                )}
                Suggest
              </Button>
            </div>

            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="text-xs h-auto py-1 px-2 border border-border"
                    onClick={() => setReplyContent(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
