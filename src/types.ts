import { User } from "firebase/auth";

export type UserRole = 'admin' | 'editor' | 'author';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: number;
  role: UserRole;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  updatedAt: number;
  category: string;
  tags: string[];
  imageUrl?: string;
  views?: number;
  likes?: number;
  isFeatured?: boolean;
  status?: 'draft' | 'published';
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: number;
}
