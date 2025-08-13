export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export interface Post {
  id: string;
  created_at: string;
  content: string;
  tags: string[] | null;
  author: Profile;
  likes: number;
  comments: Comment[];
  // It's good practice to also include the user_id
  user_id: string;
}

export interface Comment {
  id: string;
  created_at: string;
  content: string;
  author: Profile;
  likes: number;
  // It's good practice to also include the user_id and post_id
  user_id: string;
  post_id: string;
}
