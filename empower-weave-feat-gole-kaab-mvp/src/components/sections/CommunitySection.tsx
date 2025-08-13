import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPosts, createPost, togglePostLike } from '@/integrations/supabase/api';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { MessageSquare, Heart, Share2, Reply, Bot, Languages, Users, ChevronDown, Loader2 } from 'lucide-react';
import { PostComments } from './PostComments';

export const CommunitySection = () => {
  const [newPostContent, setNewPostContent] = useState('');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: posts, isLoading: isLoadingPosts, error: postsError } = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  });

  const aiSuggestions = [
    "What specific skills training programs have shown the most success in your community?",
    "How can we better support women entrepreneurs in accessing financial resources?",
    "What are the most effective advocacy strategies for disability rights in urban planning?"
  ];

  const createPostMutation = useMutation({
    mutationFn: (newPost: { content: string; userId: string; }) =>
      createPost(newPost.content, newPost.userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setNewPostContent('');
      toast({
        title: "Post created successfully!",
        description: "Your post is now live for the community to see.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const translateMutation = useMutation({
    mutationFn: async (text: string) => {
      const { data, error } = await supabase.functions.invoke('translate-comment', {
        body: { text, targetLang: 'so' }, // Example: translate to Somali
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Translated Text",
        description: data.translatedText,
      });
    },
    onError: (error) => {
      toast({
        title: "Error translating",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreatePost = () => {
    if (newPostContent.trim() && user) {
      createPostMutation.mutate({ content: newPostContent, userId: user.id });
    }
  };

  const toggleLikeMutation = useMutation({
    mutationFn: (postId: string) => togglePostLike(postId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAISuggestion = (suggestion: string) => {
    setNewPostContent(suggestion);
    toast({
      title: "AI suggestion added",
      description: "You can edit this suggestion before posting.",
    });
  };

  return (
    <section id="community" className="py-20 bg-gradient-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Community Discussions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with others, share experiences, and collaborate on solutions.
            AI-powered suggestions help facilitate meaningful conversations.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* New Post/Comment Section */}
          <Card className="bg-background/70 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Join the Conversation
              </CardTitle>
              <CardDescription>
                Share your thoughts, ask questions, or contribute to ongoing discussions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="What's on your mind? Share your experiences, ask questions, or offer support..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-[100px] resize-none transition-all duration-300 focus:shadow-soft"
              />

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim() || createPostMutation.isPending || !user}
                  className="flex-1"
                >
                  {createPostMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Post
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => translateMutation.mutate(newPostContent)}
                  disabled={!newPostContent.trim() || translateMutation.isPending}
                >
                  {translateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Languages className="w-4 h-4" />
                  )}
                  Translate
                </Button>
              </div>

              {/* AI Suggestions */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">AI Discussion Starters</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleAISuggestion(suggestion)}
                      className="text-left p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-300 text-sm text-muted-foreground hover:text-foreground"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Community Posts */}
          <div className="space-y-6">
            {isLoadingPosts && (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            {postsError && (
              <div className="text-center p-8 text-destructive">
                <p>Error loading posts. Please try again later.</p>
              </div>
            )}
            {posts?.map((post) => (
              <Card key={post.id} className="bg-background/50 backdrop-blur-sm border-border/50 hover:shadow-soft transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground font-medium">
                          {post.author.display_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground">{post.author.display_name || 'Anonymous'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(post.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {/* Language badge can be a future feature */}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-foreground leading-relaxed">{post.content}</p>

                  <div className="flex flex-wrap gap-2">
                    {post.tags?.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-primary"
                        onClick={() => user && toggleLikeMutation.mutate(post.id)}
                        disabled={!user || toggleLikeMutation.isPending}
                      >
                        <Heart className="w-4 h-4 mr-1" />
                        {post.likes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-primary"
                        onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        {post.comments_count}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedPost === post.id ? 'rotate-180' : ''}`} />
                    </Button>
                  </div>

                  {/* Expanded Comments Section */}
                  {expandedPost === post.id && <PostComments postId={post.id} />}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center">
            <Button variant="outline" className="px-8">
              Load More Discussions
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};