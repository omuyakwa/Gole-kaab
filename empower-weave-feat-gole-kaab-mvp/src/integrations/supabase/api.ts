import { supabase } from './client';
import { Post, Comment } from './data-types';

/**
 * Fetches all posts with author details, likes, and comments count.
 * Can be filtered by channel.
 */
export const getPosts = async (channel?: string): Promise<Post[]> => {
  let query = supabase
    .from('posts')
    .select(`
      id,
      created_at,
      content,
      tags,
      channel,
      user_id,
      profiles (
        id,
        display_name,
        avatar_url
      ),
      likes ( count ),
      comments ( count )
    `)
    .order('created_at', { ascending: false });

  if (channel && channel !== 'all') {
    query = query.eq('channel', channel);
  }

  const { data: posts, error } = await query;

  if (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }

  // The 'profiles' key needs to be renamed to 'author' to match our Post type
  // and the counts need to be flattened.
  return posts.map((post: any) => ({
    ...post,
    author: post.profiles,
    likes: post.likes[0]?.count || 0,
    comments_count: post.comments[0]?.count || 0,
    comments: [], // Comments will be fetched separately when a post is expanded
  }));
};

/**
 * Creates a new post.
 */
export const createPost = async (content: string, userId: string, channel: string, tags?: string[]): Promise<any> => {
  const { data, error } = await supabase
    .from('posts')
    .insert([{ content, user_id: userId, channel, tags: tags || [] }])
    .select();

  if (error) {
    console.error('Error creating post:', error);
    throw error;
  }
  return data;
};

// Admin-only functions

export const getAllUsers = async () => {
  const { data, error } = await supabase.rpc('get_all_users');
  if (error) throw error;
  return data;
};

export const createDocument = async (document: { user_id: string, title: string, description: string, file_path: string, file_type: string, file_size: number, alt_text?: string }) => {
  const { data, error } = await supabase.from('documents').insert(document).select();
  if (error) throw error;
  return data;
};

export const getHelplines = async () => {
  const { data, error } = await supabase.from('helplines').select('*');
  if (error) throw error;
  return data;
};

export const getAllUploads = async () => {
  const { data, error } = await supabase.rpc('get_all_uploads');
  if (error) throw error;
  return data;
};

export const getFlaggedComments = async () => {
  const { data, error } = await supabase.rpc('get_flagged_comments');
  if (error) throw error;
  return data;
};

/**
 * Fetches aggregated statistics for a specific user.
 */
export const getUserStats = async (userId: string): Promise<{ post_count: number; comment_count: number }> => {
  if (!userId) {
    return { post_count: 0, comment_count: 0 };
  }

  const { data, error } = await supabase.rpc('get_user_stats', { p_user_id: userId }).single();

  if (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
  return data;
};

/**
 * Fetches all comments for a specific post with author details and likes count.
 */
export const getComments = async (postId: string): Promise<Comment[]> => {
  const { data: comments, error } = await supabase
    .from('comments')
    .select(`
      id,
      created_at,
      content,
      user_id,
      post_id,
      profiles (
        id,
        display_name,
        avatar_url
      ),
      likes ( count )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }

  return comments.map((comment: any) => ({
    ...comment,
    author: comment.profiles,
    likes: comment.likes[0]?.count || 0,
  }));
};

/**
 * Creates a new comment on a post.
 */
export const createComment = async (content: string, postId: string, userId: string): Promise<any> => {
  const { data, error } = await supabase
    .from('comments')
    .insert([{ content, post_id: postId, user_id: userId }])
    .select();

  if (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
  return data;
};

/**
 * Toggles a like on a post for a user.
 * If the user has already liked the post, it unlikes it.
 * If the user has not liked the post, it likes it.
 */
export const togglePostLike = async (postId: string, userId: string): Promise<any> => {
  // First, check if the user has already liked the post
  const { data: existingLike, error: selectError } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();

  if (selectError && selectError.code !== 'PGRST116') { // PGRST116: no rows found
    console.error('Error checking for existing like:', selectError);
    throw selectError;
  }

  if (existingLike) {
    // User has liked the post, so unlike it
    const { error: deleteError } = await supabase
      .from('likes')
      .delete()
      .eq('id', existingLike.id);

    if (deleteError) {
      console.error('Error unliking post:', deleteError);
      throw deleteError;
    }
    return { message: 'Post unliked successfully' };
  } else {
    // User has not liked the post, so like it
    const { error: insertError } = await supabase
      .from('likes')
      .insert([{ post_id: postId, user_id: userId }]);

    if (insertError) {
      console.error('Error liking post:', insertError);
      throw insertError;
    }
    return { message: 'Post liked successfully' };
  }
};

/**
 * Fetches aggregated dashboard statistics.
 */
export const getDashboardStats = async (): Promise<any> => {
  const { data, error } = await supabase.rpc('get_dashboard_stats');

  if (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
  return data;
};

/**
 * Fetches the number of posts per day for the last 30 days.
 */
export const getPostsPerDay = async (): Promise<{ day: string; count: number }[]> => {
  const { data, error } = await supabase.rpc('get_posts_per_day');

  if (error) {
    console.error('Error fetching posts per day:', error);
    throw error;
  }
  return data;
};
