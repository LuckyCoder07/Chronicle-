import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPosts, getCategories, getTags } from "../lib/db";
import { Post, Category, Tag } from "../types";
import { formatDistanceToNow } from "date-fns";
import { motion } from "motion/react";
import { PostItemSkeleton, SkeletonPulse } from "../components/Skeletons";

export function Author() {
  const { uid } = useParams<{ uid: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    Promise.all([
      getPosts(),
      getCategories(),
      getTags()
    ]).then(([data, cats, tgs]) => {
      const authorPosts = data.filter(p => p.authorId === uid);
      setPosts(authorPosts);
      if (authorPosts.length > 0) {
        setAuthorName(authorPosts[0].authorName);
      }
      setCategories(cats);
      setTags(tgs);
      setLoading(false);
    });
  }, [uid]);

  if (loading) {
    return (
      <div className="p-[40px] max-w-5xl mx-auto">
        <header className="mb-[48px] space-y-4">
          <SkeletonPulse className="w-[80px] h-[80px] rounded-full" />
          <SkeletonPulse className="h-10 md:h-12 w-2/3" />
          <SkeletonPulse className="h-4 w-1/2" />
        </header>
        <div className="flex flex-col gap-8">
          <PostItemSkeleton />
          <PostItemSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="p-[40px] max-w-5xl mx-auto">
      <header className="mb-[60px] pb-[40px] border-b border-editorial-border">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] bg-editorial-text text-editorial-bg rounded-full flex items-center justify-center text-[32px] font-serif font-bold shrink-0">
            {authorName ? authorName.charAt(0).toUpperCase() : 'A'}
          </div>
          <div>
            <h1 className="font-serif font-bold text-[36px] md:text-[48px] text-editorial-text tracking-[-1px] mb-3">
              {authorName || 'Unknown Author'}
            </h1>
            <p className="text-[16px] text-editorial-muted max-w-2xl leading-relaxed">
              Content creator and author sharing perspectives on technology, design, and culture. 
              Exploring the intersection of modern life and the digital age through thoughtful commentary and deep dives.
            </p>
          </div>
        </div>
      </header>

      <div className="font-serif italic text-[14px] text-editorial-accent mb-[30px]">
        Articles by {authorName}
      </div>

      {posts.length === 0 ? (
        <p className="text-editorial-muted text-[15px]">No posts found for this author.</p>
      ) : (
        <div className="flex flex-col gap-[60px]">
          {posts.map((post, index) => {
            const category = categories.find(c => c.id === post.category);
            return (
              <motion.article 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="max-w-3xl group border-b border-editorial-border pb-[40px] last:border-0"
              >
                <div className="mb-[20px]">
                  <Link to={`/post/${post.id}`} className="inline-block focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none rounded">
                    <h2 className="font-serif font-bold text-[28px] md:text-[36px] text-editorial-text leading-[1.1] tracking-[-1px] mb-[15px] group-hover:opacity-70 transition-opacity">
                      {post.title}
                    </h2>
                  </Link>
                  <div className="text-[16px] text-editorial-muted leading-[1.6] line-clamp-3 font-serif"
                    dangerouslySetInnerHTML={{ __html: post.content.replace(/<[^>]+>/g, '') }}
                  />
                </div>

                <div className="flex items-center gap-[15px]">
                  <span className="text-[11px] font-bold uppercase tracking-[1px] text-editorial-muted">
                    {formatDistanceToNow(post.createdAt || 0, { addSuffix: true })}
                  </span>
                  {category && (
                    <Link 
                      to={`/?category=${category.id}`} 
                      className="px-[10px] py-[4px] bg-editorial-active text-[10px] font-bold uppercase tracking-[1.5px] text-editorial-text hover:bg-editorial-border transition-colors focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none"
                    >
                      {category.name}
                    </Link>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}
