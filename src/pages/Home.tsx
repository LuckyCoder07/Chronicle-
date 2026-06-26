import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getPosts, getCategories, getTags } from "../lib/db";
import { Post, Category, Tag } from "../types";
import { formatDistanceToNow } from "date-fns";
import { motion } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { useSearch } from "../contexts/SearchContext";
import { searchPosts } from "../utils/search";
import { PostItemSkeleton, FeaturedCarouselSkeleton } from "../components/Skeletons";
import { Carousel } from "../components/Carousel";
import { LazyImage } from "../components/LazyImage";
import { Eye, Heart, TrendingUp, SlidersHorizontal, ArrowUpDown } from "lucide-react";

export function Home() {
  const [unfilteredPosts, setUnfilteredPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"date" | "views" | "likes">("date");
  const [searchParams] = useSearchParams();
  const { profile } = useAuth();
  const { searchQuery } = useSearch();

  const categoryId = searchParams.get("category");
  const tagId = searchParams.get("tag");
  const isUserMe = searchParams.get("user") === "me";
  const statusFilter = searchParams.get("status");

  useEffect(() => {
    setLoading(true);
    const authorIdQuery = (isUserMe || statusFilter === "draft") ? profile?.uid : undefined;
    Promise.all([
      getPosts(categoryId || undefined, tagId || undefined, authorIdQuery),
      getCategories(),
      getTags()
    ]).then(([data, cats, tgs]) => {
      setUnfilteredPosts(data);
      setCategories(cats);
      setTags(tgs);
      setLoading(false);
    });
  }, [categoryId, tagId, isUserMe, statusFilter, profile?.uid]);

  // Apply filters including drafts and liked posts
  let posts = searchPosts(unfilteredPosts, searchQuery);
  
  if (statusFilter === "draft") {
    posts = posts.filter(p => p.status === "draft" && p.authorId === profile?.uid);
  } else if (statusFilter === "liked") {
    if (profile) {
      try {
        const likedList = JSON.parse(localStorage.getItem(`liked-posts-${profile.uid}`) || "[]") as string[];
        posts = posts.filter(p => likedList.includes(p.id) && p.status !== "draft");
      } catch {
        posts = [];
      }
    } else {
      posts = [];
    }
  } else {
    // Public view: hide all drafts (unless the user has a draft they authored and wants to edit, but default is hiding them)
    posts = posts.filter(p => p.status !== "draft");
  }

  // Handle feed sorting options
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === "views") {
      return (b.views || 0) - (a.views || 0);
    }
    if (sortBy === "likes") {
      return (b.likes || 0) - (a.likes || 0);
    }
    return b.createdAt - a.createdAt; // Default date desc
  });

  const isDefaultHome = !categoryId && !tagId && !isUserMe && !statusFilter && !searchQuery;

  if (loading) {
    return (
      <div className="p-[20px] md:p-[40px] max-w-5xl mx-auto" aria-busy="true" aria-label="Loading chronicles feed">
        {isDefaultHome && <FeaturedCarouselSkeleton />}
        <div className="flex flex-col gap-8 mt-6">
          <PostItemSkeleton />
          <PostItemSkeleton />
          <PostItemSkeleton />
        </div>
      </div>
    );
  }

  const filteredCategoryName = categoryId ? categories.find(c => c.id === categoryId)?.name : null;
  const filteredTagName = tagId ? tags.find(t => t.id === tagId)?.name : null;

  return (
    <div className="p-[20px] md:p-[40px] max-w-5xl mx-auto">
      {/* High-End Featured Carousel - Display only on main feed */}
      {isDefaultHome && (
        <div className="mb-[12px]" role="region" aria-label="Featured content">
          <div className="flex items-center gap-2 mb-3 text-[11px] font-bold uppercase tracking-[1.5px] text-editorial-accent">
            <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
            Curator's Premium Picks
          </div>
          <Carousel posts={posts} categories={categories} />
        </div>
      )}

      {/* "Write a Blog" Promoted Section inside Hero region */}
      {isDefaultHome && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-[40px] p-[24px] bg-editorial-panel border border-editorial-border hover:border-editorial-accent transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div>
            <h3 className="font-serif text-xl font-bold text-editorial-text mb-1">Share Your Perspectives</h3>
            <p className="font-sans text-xs text-editorial-muted max-w-lg leading-relaxed">
              Have an insights-rich tech guide, coding discovery, or productivity philosophy? Craft and publish your next blog post in Chronicle's custom high-precision writing editor.
            </p>
          </div>
          <Link 
            to="/new" 
            className="px-[20px] py-[10px] text-[11px] font-bold uppercase tracking-[1px] border border-editorial-text bg-editorial-text text-editorial-bg hover:bg-transparent hover:text-editorial-text transition-all self-start md:self-auto shrink-0 whitespace-nowrap"
          >
            + Write a Blog
          </Link>
        </motion.div>
      )}

        {/* Feed Title and Controls Header */}
      <header className="mb-[36px] flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="font-serif italic text-[14px] text-editorial-accent mb-[8px]">
              {searchQuery 
                ? `Search Results` 
                : isUserMe 
                  ? "Your Chronicles" 
                  : statusFilter === "draft"
                    ? "Your Drafts Workspace"
                    : statusFilter === "liked"
                      ? "Curated Favorites"
                      : filteredCategoryName 
                        ? `Category: ${filteredCategoryName}` 
                        : filteredTagName 
                          ? `Tag: #${filteredTagName}` 
                          : "The Journal Feed"}
            </div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.1 }}
              className="font-serif text-[32px] md:text-[44px] leading-[1.1] tracking-[-0.8px] text-editorial-text"
            >
              {searchQuery 
                ? `Results for "${searchQuery}"` 
                : isUserMe 
                  ? "Your Perspectives" 
                  : statusFilter === "draft"
                    ? "Draft Publications"
                    : statusFilter === "liked"
                      ? "Liked Posts"
                      : filteredCategoryName || filteredTagName 
                        ? "Filtered Perspectives" 
                        : "Latest Publications"}
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.15 }}
              className="font-sans text-[14px] text-editorial-muted max-w-xl mt-2"
            >
              {searchQuery 
                ? `Found ${posts.length} articles matching your search query.` 
                : isUserMe 
                  ? "Manage and review your published articles." 
                  : statusFilter === "draft"
                    ? "Refine your unpublished pieces and prep them for full publication."
                    : statusFilter === "liked"
                      ? "Essays and guides you have starred and found insightful."
                      : "Explore curated essays, coding tips, and modern cultural critiques."}
            </motion.p>
          </div>

          {/* Enhanced Feed Controls - Sort Dropdown */}
          {posts.length > 0 && (
            <div className="flex items-center gap-2 self-start md:self-auto shrink-0 bg-editorial-panel border border-editorial-border px-3 py-2 text-[12px] rounded focus-within:ring-2 focus-within:ring-editorial-accent">
              <SlidersHorizontal className="w-3.5 h-3.5 text-editorial-muted" aria-hidden="true" />
              <label htmlFor="feed-sort-select" className="text-editorial-muted font-medium">Sort:</label>
              <select
                id="feed-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none outline-none font-semibold text-editorial-text cursor-pointer focus:ring-0 text-[12px]"
                aria-label="Sort articles feed"
              >
                <option value="date" className="bg-editorial-panel text-editorial-text">Latest Blogs</option>
                <option value="views" className="bg-editorial-panel text-editorial-text">Most Viewed</option>
                <option value="likes" className="bg-editorial-panel text-editorial-text">Highest Likes</option>
              </select>
            </div>
          )}
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap gap-2">
          <Link
            to="/"
            className={`px-3 py-1 text-[11px] font-bold uppercase tracking-[0.5px] rounded-full border transition-colors ${
              !tagId 
                ? "bg-editorial-text text-editorial-bg border-editorial-text" 
                : "bg-editorial-panel text-editorial-muted border-editorial-border hover:border-editorial-text"
            }`}
          >
            All
          </Link>
          {tags.map((tag) => (
            <Link
              key={tag.id}
              to={`/?tag=${tag.id}`}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-[0.5px] rounded-full border transition-colors ${
                tagId === tag.id
                  ? "bg-editorial-text text-editorial-bg border-editorial-text" 
                  : "bg-editorial-panel text-editorial-muted border-editorial-border hover:border-editorial-text"
              }`}
            >
              {tag.name}
            </Link>
          ))}
        </div>
      </header>

      {/* Feed List Grid */}
      {sortedPosts.length === 0 ? (
        <div className="py-[60px] text-editorial-muted text-center border-t border-editorial-border font-serif italic" role="status">
          No chronicles found matching this criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[40px] gap-y-[48px] border-t border-editorial-border pt-[40px]" role="feed" aria-busy="false" aria-label="Chronicles Feed">
          {sortedPosts.map((post, index) => (
            <PostCard key={post.id} post={post} index={index} categories={categories} tags={tags} />
          ))}
        </div>
      )}
    </div>
  );
}

function PostCard({ post, index, categories, tags }: { post: Post; index: number, categories: Category[], tags: Tag[] }) {
  // Strip HTML from content for the preview
  const strippedContent = post.content.replace(/<[^>]+>/g, ' ');

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
      className="group relative flex flex-col h-full border-b border-editorial-border/60 pb-[24px]"
      aria-labelledby={`post-title-${post.id}`}
    >
      <div className="flex-1">
        {/* Author details with profile circle */}
        <div className="flex items-center gap-[12px] mb-[16px]">
          <div className="w-[30px] h-[30px] bg-editorial-text text-editorial-bg rounded-full flex items-center justify-center text-[10px] font-bold uppercase shrink-0">
            {post.authorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <Link to={`/author/${post.authorId}`} className="font-semibold text-[13px] text-editorial-text hover:underline focus-visible:ring-2 focus-visible:ring-editorial-accent focus-visible:ring-offset-2 outline-none">
              {post.authorName}
            </Link>
            <p className="text-[10px] text-editorial-muted uppercase tracking-[0.5px] mt-[1px]">{formatDistanceToNow(post.createdAt, { addSuffix: true })}</p>
          </div>
        </div>

        {/* Large Cover Image inside the post list card using LazyImage */}
        {post.imageUrl && (
          <Link 
            to={`/post/${post.id}`} 
            className="block overflow-hidden border border-editorial-border mb-[16px] aspect-[16/10] relative bg-editorial-panel focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none"
            aria-label={`Read blog: ${post.title}`}
          >
            <LazyImage 
              src={post.imageUrl} 
              alt={post.title} 
              priority={index < 2}
              className="w-full h-full object-cover filter grayscale-[10%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
              wrapperClassName="w-full h-full"
            />
          </Link>
        )}
        
        {post.category && (
          <Link 
            to={`/?category=${post.category}`} 
            className="inline-block mb-[10px] text-[10px] font-bold uppercase tracking-[1px] text-editorial-accent hover:underline focus-visible:ring-1 focus-visible:ring-editorial-accent outline-none"
          >
            {categories.find(c => c.id === post.category)?.name || "Chronicle"}
          </Link>
        )}
        
        <h2 id={`post-title-${post.id}`} className="font-serif text-[22px] md:text-[24px] font-bold text-editorial-text leading-[1.25] mb-[12px] group-hover:text-editorial-accent transition-colors">
          <Link to={`/post/${post.id}`} className="hover:underline focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none">
            {post.title}
          </Link>
        </h2>
        
        <p className="font-serif text-[15px] leading-[1.6] text-editorial-muted line-clamp-3">
          {strippedContent}
        </p>
      </div>
      
      {/* Footer controls: Read Article & Views/Likes Counters */}
      <div className="mt-[20px] flex items-center justify-between pt-4 border-t border-editorial-border/40">
        <Link 
          to={`/post/${post.id}`} 
          className="text-[11px] font-bold uppercase tracking-[1px] text-editorial-text hover:text-editorial-accent transition-colors flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none"
          aria-label={`Read Full Blog: ${post.title}`}
        >
          Read Blog &rarr;
        </Link>
        
        <div className="flex items-center gap-4 text-[11px] text-editorial-muted font-mono">
          <div className="flex items-center gap-1" title={`${post.views || 0} views`}>
            <Eye className="w-3.5 h-3.5 text-editorial-muted" aria-hidden="true" />
            <span>{post.views || 0}</span>
          </div>
          <div className="flex items-center gap-1" title={`${post.likes || 0} likes`}>
            <Heart className="w-3.5 h-3.5 text-editorial-muted" aria-hidden="true" />
            <span>{post.likes || 0}</span>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="hidden sm:flex gap-[4px] ml-2">
              {post.tags.slice(0, 1).map(tagId => {
                const tag = tags.find(t => t.id === tagId);
                return tag ? (
                  <Link 
                    key={tag.id} 
                    to={`/?tag=${tag.id}`} 
                    className="text-[9px] uppercase tracking-[0.5px] text-editorial-muted hover:text-editorial-text border border-editorial-border px-[6px] py-[2px] rounded-full focus-visible:ring-1 focus-visible:ring-editorial-accent outline-none"
                  >
                    #{tag.name}
                  </Link>
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
