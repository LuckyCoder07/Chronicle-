import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy, where } from "firebase/firestore";
import { db } from "./firebase";
import { Post, Comment, Category, Tag } from "../types";
import { MOCK_POSTS, MOCK_CATEGORIES, MOCK_TAGS } from "./mockData";

export const getPosts = async (categoryId?: string, tagId?: string, authorId?: string): Promise<Post[]> => {
  let q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  
  if (categoryId) {
    q = query(collection(db, "posts"), where("category", "==", categoryId), orderBy("createdAt", "desc"));
  } else if (tagId) {
    q = query(collection(db, "posts"), where("tags", "array-contains", tagId), orderBy("createdAt", "desc"));
  } else if (authorId) {
    q = query(collection(db, "posts"), where("authorId", "==", authorId), orderBy("createdAt", "desc"));
  }

  try {
    const snapshot = await getDocs(q);
    let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
    
    // Merge mock data
    let mockData = [...MOCK_POSTS];
    if (categoryId) mockData = mockData.filter(p => p.category === categoryId);
    if (tagId) mockData = mockData.filter(p => p.tags.includes(tagId));
    if (authorId) mockData = mockData.filter(p => p.authorId === authorId);
    
    const allPosts = [...data, ...mockData];
    allPosts.sort((a, b) => b.createdAt - a.createdAt);
    return allPosts;
  } catch (err) {
    console.error(err);
    let mockData = [...MOCK_POSTS];
    if (categoryId) mockData = mockData.filter(p => p.category === categoryId);
    if (tagId) mockData = mockData.filter(p => p.tags.includes(tagId));
    if (authorId) mockData = mockData.filter(p => p.authorId === authorId);
    return mockData;
  }
};

export const getPost = async (id: string): Promise<Post | null> => {
  const mockPost = MOCK_POSTS.find(p => p.id === id);
  if (mockPost) return mockPost;
  
  try {
    const docRef = doc(db, "posts", id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Post;
  } catch (err) {
    return null;
  }
};

export const createPost = async (postData: Omit<Post, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  const docRef = await addDoc(collection(db, "posts"), {
    ...postData,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return docRef.id;
};

export const updatePost = async (id: string, postData: Partial<Post>): Promise<void> => {
  const docRef = doc(db, "posts", id);
  await updateDoc(docRef, {
    ...postData,
    updatedAt: Date.now(),
  });
};

export const deletePost = async (id: string): Promise<void> => {
  const docRef = doc(db, "posts", id);
  await deleteDoc(docRef);
};

export const getComments = async (postId: string): Promise<Comment[]> => {
  const q = query(collection(db, "comments"), where("postId", "==", postId), orderBy("createdAt", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
};

export const createComment = async (commentData: Omit<Comment, "id" | "createdAt">): Promise<string> => {
  const docRef = await addDoc(collection(db, "comments"), {
    ...commentData,
    createdAt: Date.now(),
  });
  return docRef.id;
};

export const updateComment = async (id: string, content: string): Promise<void> => {
  const docRef = doc(db, "comments", id);
  await updateDoc(docRef, {
    content,
    updatedAt: Date.now(),
  });
};

export const deleteComment = async (id: string): Promise<void> => {
  const docRef = doc(db, "comments", id);
  await deleteDoc(docRef);
};

export const subscribeEmail = async (email: string): Promise<string> => {
  const docRef = await addDoc(collection(db, "subscribers"), {
    email,
    subscribedAt: Date.now(),
  });
  return docRef.id;
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    const q = query(collection(db, "categories"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    
    // Merge unique mock categories
    const allCategories = [...data];
    for (const mockCat of MOCK_CATEGORIES) {
      if (!allCategories.some(c => c.slug === mockCat.slug)) {
        allCategories.push(mockCat);
      }
    }
    return allCategories;
  } catch (err) {
    return MOCK_CATEGORIES;
  }
};

export const getTags = async (): Promise<Tag[]> => {
  try {
    const q = query(collection(db, "tags"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tag));
    
    // Merge unique mock tags
    const allTags = [...data];
    for (const mockTag of MOCK_TAGS) {
      if (!allTags.some(t => t.slug === mockTag.slug)) {
        allTags.push(mockTag);
      }
    }
    return allTags;
  } catch (err) {
    return MOCK_TAGS;
  }
};

export const createCategory = async (name: string): Promise<string> => {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const docRef = await addDoc(collection(db, "categories"), { name, slug });
  return docRef.id;
};

export const createTag = async (name: string): Promise<string> => {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const docRef = await addDoc(collection(db, "tags"), { name, slug });
  return docRef.id;
};
