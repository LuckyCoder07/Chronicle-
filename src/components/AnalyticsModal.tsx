import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getPosts } from "../lib/db";
import { Post } from "../types";
import { X, Eye, Heart, BookOpen, BarChart2, TrendingUp, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AnalyticsModal({ isOpen, onClose }: AnalyticsModalProps) {
  const { profile } = useAuth();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && profile) {
      setLoading(true);
      getPosts(undefined, undefined, profile.uid)
        .then((posts) => {
          // Filter to posts created by me
          const myPosts = posts.filter(p => p.authorId === profile.uid);
          setUserPosts(myPosts);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  // Compute metrics
  const totalPosts = userPosts.length;
  const totalViews = userPosts.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalLikes = userPosts.reduce((acc, p) => acc + (p.likes || 0), 0);
  const avgViews = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;

  // Sorted by views for top posts
  const topPosts = [...userPosts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4);

  // Generate data for custom responsive SVG chart
  // We will display up to 6 of the newest posts to show engagement comparison
  const chartPosts = [...userPosts]
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(-6);

  const maxViews = Math.max(...chartPosts.map(p => p.views || 0), 10);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="bg-editorial-bg border border-editorial-border w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative z-10 flex flex-col rounded-lg"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-editorial-border bg-editorial-panel rounded-t-lg shrink-0">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-editorial-accent" />
              <h2 className="font-serif text-2xl font-bold text-editorial-text">
                Your Journal Analytics
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-editorial-active text-editorial-muted hover:text-editorial-text rounded transition-colors focus:outline-none focus:ring-2 focus:ring-editorial-accent"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 flex-1 space-y-6 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col justify-center items-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-editorial-text border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-mono text-editorial-muted tracking-[1px] uppercase">Retrieving Metrics...</span>
              </div>
            ) : userPosts.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-editorial-border">
                <BookOpen className="w-10 h-10 text-editorial-muted mx-auto mb-4" />
                <p className="font-serif text-lg text-editorial-text font-bold mb-1">No blog posts found</p>
                <p className="font-sans text-xs text-editorial-muted max-w-xs mx-auto mb-6">
                  Analytics will populate once you publish or draft your first blog post.
                </p>
              </div>
            ) : (
              <>
                {/* Stat Grid (Bento Style) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-editorial-panel border border-editorial-border p-5 rounded-md flex flex-col justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-muted mb-2 block">Total Publications</span>
                    <div className="flex items-baseline gap-1 mt-auto">
                      <span className="text-3xl font-serif font-black text-editorial-text">{totalPosts}</span>
                      <span className="text-[10px] text-editorial-muted font-mono">blogs</span>
                    </div>
                  </div>
                  <div className="bg-editorial-panel border border-editorial-border p-5 rounded-md flex flex-col justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-muted mb-2 block">Overall Views</span>
                    <div className="flex items-baseline gap-1 mt-auto">
                      <span className="text-3xl font-serif font-black text-editorial-accent">{totalViews.toLocaleString()}</span>
                      <span className="text-[10px] text-editorial-muted font-mono"><Eye className="w-3 h-3 inline mr-0.5" /> views</span>
                    </div>
                  </div>
                  <div className="bg-editorial-panel border border-editorial-border p-5 rounded-md flex flex-col justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-muted mb-2 block">Appreciation Rate</span>
                    <div className="flex items-baseline gap-1 mt-auto">
                      <span className="text-3xl font-serif font-black text-editorial-text">{totalLikes.toLocaleString()}</span>
                      <span className="text-[10px] text-editorial-muted font-mono"><Heart className="w-3 h-3 inline text-red-500 mr-0.5" /> likes</span>
                    </div>
                  </div>
                  <div className="bg-editorial-panel border border-editorial-border p-5 rounded-md flex flex-col justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-muted mb-2 block">Avg. Engagement</span>
                    <div className="flex items-baseline gap-1 mt-auto">
                      <span className="text-3xl font-serif font-black text-editorial-text">{avgViews}</span>
                      <span className="text-[10px] text-editorial-muted font-mono">per blog</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Visual Chart */}
                  <div className="lg:col-span-2 bg-editorial-panel border border-editorial-border p-5 rounded-md flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-editorial-text">Views per Blog</h3>
                      <span className="text-[10px] font-mono text-editorial-muted">Last 6 posts comparison</span>
                    </div>

                    {/* Responsive SVG Chart */}
                    <div className="flex-1 min-h-[220px] relative flex items-end justify-between px-2 pt-6 pb-2">
                      {chartPosts.map((post, i) => {
                        const heightPercent = ((post.views || 0) / maxViews) * 80 + 10; // 10% - 90%
                        return (
                          <div key={post.id} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end px-1">
                            {/* Hover tooltip */}
                            <div className="absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity bg-editorial-text text-editorial-bg text-[10px] font-mono px-2 py-1 rounded shadow-lg pointer-events-none z-10">
                              {post.views || 0} views
                            </div>
                            
                            {/* Bar representing Views */}
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${heightPercent}%` }}
                              transition={{ duration: 0.6, delay: i * 0.05 }}
                              className="w-full max-w-[28px] bg-editorial-accent rounded-t hover:opacity-80 transition-opacity duration-300 relative border-t border-x border-editorial-text/20"
                            />
                            
                            {/* Post initial or shortened label */}
                            <span className="text-[9px] font-mono text-editorial-muted truncate w-full text-center">
                              {post.title.substring(0, 8)}...
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Top Performing Posts list */}
                  <div className="bg-editorial-panel border border-editorial-border p-5 rounded-md flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-4">
                        <TrendingUp className="w-4 h-4 text-editorial-accent" />
                        <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-editorial-text">Top Performing Posts</h3>
                      </div>

                      <div className="space-y-4">
                        {topPosts.map((p, idx) => (
                          <div key={p.id} className="flex items-start gap-3 border-b border-editorial-border pb-3 last:border-0 last:pb-0">
                            <span className="text-xs font-mono font-bold text-editorial-accent">{idx + 1}.</span>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-editorial-text truncate hover:underline cursor-pointer">
                                {p.title}
                              </h4>
                              <div className="flex items-center gap-3 text-[10px] text-editorial-muted font-mono mt-0.5">
                                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {p.views || 0}</span>
                                <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {p.likes || 0}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
