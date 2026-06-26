import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPost, deletePost, getComments, createComment, deleteComment, getCategories, getTags, getPosts, updatePost, updateComment } from "../lib/db";
import { Post, Comment, Category, Tag } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence, useSpring, useMotionValue } from "motion/react";
import { Edit2, Trash2, MessageSquare, ArrowLeft, Tag as TagIcon, Folder, Twitter, Linkedin, Facebook, Eye, Heart, MessageCircle, X, Send, Smile, ThumbsUp, Share2 } from "lucide-react";
import { Newsletter } from "../components/Newsletter";
import { PostDetailSkeleton } from "../components/Skeletons";
import { LazyImage } from "../components/LazyImage";
import { Footer } from "../components/Footer";

export function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { addToast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Engagement stats
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isMobileCommentsOpen, setIsMobileCommentsOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState("Share Blog");

  // Chat reactions & scrolling references
  const [reactions, setReactions] = useState<Record<string, Record<string, string[]>>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load reactions from LocalStorage
  useEffect(() => {
    if (id) {
      try {
        const saved = localStorage.getItem(`reactions-${id}`);
        if (saved) {
          setReactions(JSON.parse(saved));
        } else {
          setReactions({});
        }
      } catch (e) {
        console.error("Failed to load comment reactions:", e);
      }
    }
  }, [id, comments]);

  // Handle reaction toggles
  const handleReact = (commentId: string, emoji: string) => {
    if (!profile) return;
    const uid = profile.uid;

    setReactions(prev => {
      const commentReactions = prev[commentId] || {};
      const users = commentReactions[emoji] || [];

      let newUsers;
      if (users.includes(uid)) {
        newUsers = users.filter(u => u !== uid);
      } else {
        newUsers = [...users, uid];
      }

      const updated = {
        ...prev,
        [commentId]: {
          ...commentReactions,
          [emoji]: newUsers
        }
      };

      if (id) {
        localStorage.setItem(`reactions-${id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Scroll chat messages to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleWebShare = async () => {
    if (!post) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: `Read "${post.title}" on Chronicle`,
          url: window.location.href,
        });
        setShareStatus("Shared!");
        setTimeout(() => setShareStatus("Share Blog"), 2000);
      } catch (err) {
        console.log("Error sharing via Web Share API", err);
      }
    } else {
      // Fallback: Copy link
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareStatus("Link Copied!");
        setTimeout(() => setShareStatus("Share Blog"), 2000);
      } catch (err) {
        setShareStatus("Failed to Copy");
        setTimeout(() => setShareStatus("Share Blog"), 2000);
      }
    }
  };

  useEffect(() => {
    if (isCommentsOpen || isMobileCommentsOpen) {
      setTimeout(scrollToBottom, 250);
    }
  }, [isCommentsOpen, isMobileCommentsOpen, comments.length]);

  useEffect(() => {
    if (id) {
      setScrollProgress(0);
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
      setLoading(true);
      Promise.all([
        getPost(id), 
        getComments(id), 
        getCategories(), 
        getTags()
      ]).then(([postData, commentsData, cats, tgs]) => {
        if (postData) {
          setPost(postData);
          
          // Increment views dynamically
          const currentViews = postData.views || 0;
          const newViews = currentViews + 1;
          setViews(newViews);
          setLikes(postData.likes || 0);
          
          // Silently update Firestore views count if it's a persistent post
          const isMockPost = postData.id.startsWith("post") && !isNaN(Number(postData.id.replace("post", "")));
          if (!isMockPost) {
            updatePost(postData.id, { views: newViews }).catch(console.error);
          }
        }
        setComments(commentsData);
        setCategories(cats);
        setTags(tgs);
        setLoading(false);
      });
    }
  }, [id]);

  // Algorithmically fetch 3 similar posts based on tag intersection
  useEffect(() => {
    if (post && tags.length > 0) {
      getPosts().then((allPosts) => {
        const currentTags = post.tags || [];
        const filtered = allPosts
          .filter(p => p.id !== post.id) // Exclude current post
          .map(p => {
            const intersection = (p.tags || []).filter(t => currentTags.includes(t));
            // Tag overlap gives 2 points, category match gives 1 point
            const score = intersection.length * 2 + (p.category === post.category ? 1 : 0);
            return { post: p, score };
          })
          // Sort by highest score first, then newest date
          .sort((a, b) => b.score - a.score || b.post.createdAt - a.post.createdAt)
          .slice(0, 3)
          .map(item => item.post);

        setRelatedPosts(filtered);
      });
    }
  }, [post, tags, id]);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Chronicle`;
      
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      const textContent = post.content.replace(/<[^>]+>/g, '').substring(0, 160);
      metaDescription.setAttribute("content", textContent);
    }
    
    return () => {
      document.title = "Chronicle";
    };
  }, [post]);

  const [containerNode, setContainerNode] = useState<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const setRef = React.useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      containerRef.current = node;
      setContainerNode(node);
    }
  }, []);

  const scrollProgressMV = useMotionValue(0);

  const scaleX = useSpring(scrollProgressMV, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const totalScroll = scrollHeight - clientHeight;
        if (totalScroll > 0) {
          const progress = scrollTop / totalScroll;
          scrollProgressMV.set(progress);
          setScrollProgress(progress * 100);
        } else {
          scrollProgressMV.set(0);
          setScrollProgress(0);
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      // Initial evaluation
      handleScroll();
      // Additional fallback check for layout recalculations after microtask queue
      const timer = setTimeout(handleScroll, 150);
      return () => {
        container.removeEventListener("scroll", handleScroll);
        clearTimeout(timer);
      };
    }
  }, [containerNode, post, loading]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?") && id) {
      await deletePost(id);
      navigate("/");
    }
  };

  const handleLike = () => {
    if (!post) return;
    const updatedLikes = hasLiked ? likes - 1 : likes + 1;
    setLikes(updatedLikes);
    setHasLiked(!hasLiked);
    
    // Silently update Firestore likes count if it's a persistent post
    const isMockPost = post.id.startsWith("post") && !isNaN(Number(post.id.replace("post", "")));
    if (!isMockPost) {
      updatePost(post.id, { likes: updatedLikes }).catch(console.error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !id || !newComment.trim()) return;

    try {
      const commentId = await createComment({
        postId: id,
        content: newComment,
        authorId: profile.uid,
        authorName: profile.displayName,
      });

      const addedComment: Comment = {
        id: commentId,
        postId: id,
        content: newComment,
        authorId: profile.uid,
        authorName: profile.displayName,
        createdAt: Date.now(),
      };

      setComments([...comments, addedComment]);
      setNewComment("");
      addToast("Comment posted successfully!", "success");
    } catch (error) {
      addToast("Failed to post comment. Please try again.", "error");
    }
  };

  const handleEditCommentSubmit = async (commentId: string) => {
    if (!profile || !editingCommentText.trim()) return;
    try {
      await updateComment(commentId, editingCommentText);
      setComments(comments.map(c => c.id === commentId ? { ...c, content: editingCommentText } : c));
      setEditingCommentId(null);
      setEditingCommentText("");
    } catch (err) {
      console.error("Failed to edit comment:", err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm("Delete this comment?")) {
      await deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    }
  };

  const isAuthor = post ? profile?.uid === post.authorId : false;
  const isEditor = profile?.role === 'editor' || profile?.role === 'admin';
  const canEditPost = isAuthor || isEditor;

  const getInitialsColor = (name: string) => {
    const colors = [
      "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/10",
      "bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400 dark:border-cyan-500/10",
      "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400 dark:border-violet-500/10",
      "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400 dark:border-amber-500/10",
      "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400 dark:border-rose-500/10",
      "bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400 dark:border-sky-500/10",
    ];
    let sum = 0;
    const nameStr = name || "Anonymous";
    for (let i = 0; i < nameStr.length; i++) {
      sum += nameStr.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const mockEvent = { preventDefault: () => {} } as React.FormEvent;
      handleCommentSubmit(mockEvent);
    }
  };

  const renderCommentsListAndForm = (isMobile: boolean) => {
    return (
      <div className="flex flex-col h-full bg-editorial-panel/50 dark:bg-editorial-panel/20 backdrop-blur-sm">
        {!isMobile && (
          <div className="text-[11px] font-bold uppercase tracking-[1.5px] text-editorial-muted mb-[16px] flex items-center justify-between border-b border-editorial-border/60 pb-3 p-4 bg-editorial-panel shrink-0">
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-editorial-accent animate-pulse" aria-hidden="true" />
              Live Conversation ({comments.length})
            </div>
            <button 
              onClick={() => setIsCommentsOpen(false)}
              className="p-1 hover:bg-editorial-active rounded text-editorial-muted hover:text-editorial-text transition-colors outline-none focus-visible:ring-2 focus-visible:ring-editorial-accent"
              aria-label="Close conversations sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Chat Stream Feed */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-thin">
          <AnimatePresence initial={false}>
            {comments.map((comment) => {
              const isCurrentUser = profile?.uid === comment.authorId;
              const isPostAuthor = post ? comment.authorId === post.authorId : false;
              const commentReactions = reactions[comment.id] || {};
              const firstLetter = comment.authorName ? comment.authorName.charAt(0).toUpperCase() : "A";
              const avatarColorClass = getInitialsColor(comment.authorName);

              return (
                <motion.div 
                  key={comment.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 group relative items-start ${isCurrentUser ? "flex-row-reverse" : ""}`}
                  role="comment"
                >
                  {/* Avatar Initials Circle */}
                  <div className={`w-[32px] h-[32px] rounded-full border flex items-center justify-center font-bold text-[12px] shrink-0 ${avatarColorClass}`}>
                    {firstLetter}
                  </div>

                  {/* Message Bubble Container */}
                  <div className={`flex flex-col max-w-[80%] ${isCurrentUser ? "items-end" : "items-start"}`}>
                    {/* Header Details */}
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="font-semibold text-[11px] text-editorial-text">{comment.authorName}</span>
                      
                      {/* Special role badges */}
                      {isPostAuthor && (
                        <span className="text-[9px] bg-editorial-accent/10 border border-editorial-accent/20 text-editorial-accent font-bold px-1.5 py-[1px] uppercase tracking-wider rounded-sm scale-90">
                          Author
                        </span>
                      )}
                      
                      <span className="text-[9px] text-editorial-muted/80">
                        {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                      </span>
                    </div>

                    {/* Chat Bubble Body */}
                    {editingCommentId === comment.id ? (
                      <div className={`p-3 rounded-2xl text-[12.5px] leading-[1.5] shadow-sm relative min-w-[200px] ${
                        isCurrentUser 
                          ? "bg-editorial-text text-editorial-bg rounded-tr-none" 
                          : "bg-editorial-active border border-editorial-border/50 rounded-tl-none text-editorial-text"
                      }`}>
                        <textarea
                          value={editingCommentText}
                          onChange={(e) => setEditingCommentText(e.target.value)}
                          className="w-full bg-transparent text-inherit outline-none border-b border-editorial-border pb-1 resize-none font-sans text-[12.5px] leading-[1.5]"
                          rows={2}
                          autoFocus
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditingCommentText("");
                            }}
                            className="text-[10px] uppercase tracking-wider opacity-60 hover:opacity-100"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleEditCommentSubmit(comment.id)}
                            className="text-[10px] uppercase tracking-wider font-bold text-editorial-accent hover:opacity-80"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative group/bubble">
                        <div className={`p-3 rounded-2xl text-[12.5px] leading-[1.5] shadow-sm whitespace-pre-wrap break-words ${
                          isCurrentUser 
                            ? "bg-editorial-text text-editorial-bg rounded-tr-none" 
                            : "bg-editorial-active border border-editorial-border/50 rounded-tl-none text-editorial-text"
                        }`}>
                          {comment.content}
                        </div>
                        
                        {/* Action triggers shown on hover */}
                        <div className={`absolute -top-2 flex gap-1 items-center transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100 z-10 ${
                          isCurrentUser ? "-left-2" : "-right-2"
                        }`}>
                          {isCurrentUser && (
                            <button 
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditingCommentText(comment.content);
                              }}
                              className="p-1 bg-editorial-panel border border-editorial-border text-editorial-muted hover:text-editorial-text rounded-full shadow-sm outline-none transition-colors"
                              aria-label="Edit comment"
                            >
                              <Edit2 className="w-[11px] h-[11px]" />
                            </button>
                          )}
                          {(isCurrentUser || isEditor) && (
                            <button 
                              onClick={() => handleDeleteComment(comment.id)}
                              className="p-1 bg-editorial-panel border border-editorial-border text-editorial-muted hover:text-red-500 rounded-full shadow-sm outline-none transition-colors"
                              aria-label="Delete comment"
                            >
                              <Trash2 className="w-[11px] h-[11px]" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Emoji reactions bar below the bubble */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {["👍", "❤️", "🔥", "😄", "💡"].map(emoji => {
                        const reactors = commentReactions[emoji] || [];
                        const hasReacted = profile ? reactors.includes(profile.uid) : false;
                        const count = reactors.length;

                        if (count === 0 && !profile) return null;

                        return (
                          <button
                            key={emoji}
                            onClick={() => handleReact(comment.id, emoji)}
                            disabled={!profile}
                            className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border transition-all ${
                              hasReacted 
                                ? "bg-editorial-accent/10 border-editorial-accent text-editorial-text font-bold animate-ping-once" 
                                : "bg-editorial-panel/80 border-editorial-border hover:border-editorial-muted/40 text-editorial-muted"
                            } ${!profile ? "opacity-60 cursor-not-allowed" : "cursor-pointer active:scale-95"}`}
                            title={profile ? `React with ${emoji}` : "Sign in to react"}
                          >
                            <span>{emoji}</span>
                            {count > 0 && <span className="text-[9px] font-mono">{count}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {comments.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-12 px-4" role="status">
              <MessageCircle className="w-8 h-8 text-editorial-muted/40 mb-2" />
              <div className="text-[13px] font-serif italic text-editorial-muted">
                No perspectives shared yet.
              </div>
              <div className="text-[10px] text-editorial-muted mt-1 uppercase tracking-wider">
                Be the first to share your mind!
              </div>
            </div>
          )}

          {/* Scrolling anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input message box container */}
        <div className="p-4 border-t border-editorial-border shrink-0 bg-editorial-panel">
          {profile ? (
            <form onSubmit={handleCommentSubmit} aria-label="Post a new comment" className="relative">
              <div className="relative flex items-end border border-editorial-border hover:border-editorial-muted focus-within:border-editorial-text focus-within:ring-1 focus-within:ring-editorial-text transition-all bg-editorial-bg rounded-xl overflow-hidden px-3 py-2">
                <textarea
                  id={`${isMobile ? 'mobile-' : 'desktop-'}comment-text-area`}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message... (Enter to send)"
                  className="flex-1 max-h-[80px] min-h-[36px] h-[36px] bg-transparent text-[12.5px] focus:outline-none resize-none text-editorial-text pr-2 py-1 leading-[1.4] scrollbar-none"
                  required
                />
                <button 
                  type="submit"
                  disabled={!newComment.trim()}
                  className={`p-1.5 rounded-lg transition-all ${
                    newComment.trim() 
                      ? "bg-editorial-text text-editorial-bg hover:opacity-90 active:scale-95" 
                      : "bg-editorial-muted/10 text-editorial-muted/40 cursor-not-allowed"
                  }`}
                  aria-label="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="flex justify-between items-center mt-1.5 px-1">
                <span className="text-[9px] text-editorial-muted font-mono">
                  Shift+Enter for newline
                </span>
                {newComment.length > 0 && (
                  <span className={`text-[9px] font-mono ${newComment.length > 400 ? "text-editorial-accent font-bold" : "text-editorial-muted"}`}>
                    {newComment.length} chars
                  </span>
                )}
              </div>
            </form>
          ) : (
            <div className="text-center py-3 bg-editorial-active/30 border border-editorial-border border-dashed rounded-xl">
              <p className="text-[11.5px] text-editorial-muted font-serif italic mb-1.5">
                Join the conversation feed
              </p>
              <Link to="/login" className="inline-block bg-editorial-text text-editorial-bg text-[10px] font-bold uppercase tracking-[1px] px-4 py-1.5 hover:bg-editorial-muted transition-colors rounded">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full relative flex flex-col" role="article" aria-labelledby="post-main-title">
      {/* Scroll indicator bar with soft premium accent shadow glow */}
      <div 
        className="sticky top-0 w-full h-[5px] z-50 bg-editorial-border shrink-0"
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      >
        <motion.div 
          className="h-full bg-gradient-to-r from-editorial-accent/80 via-editorial-accent to-editorial-accent relative origin-left shadow-[0_2px_10px_rgba(17,17,17,0.3)] dark:shadow-[0_2px_10px_rgba(252,252,252,0.3)]"
          style={{ scaleX }}
        >
          {/* Active pulsing tip */}
          {scrollProgress > 0 && (
            <div className="absolute right-0 top-0 h-full w-[8px] bg-white dark:bg-black rounded-full blur-[2px] animate-pulse" />
          )}
        </motion.div>
        
        {/* Sleek Floating Percentage Badge */}
        {!loading && post && scrollProgress > 1 && (
          <div className="absolute right-4 top-4 bg-editorial-panel/95 backdrop-blur-md border border-editorial-border px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider text-editorial-text uppercase shadow-md rounded-full flex items-center gap-1.5 transition-all duration-300">
            <span className="w-1.5 h-1.5 rounded-full bg-editorial-accent animate-pulse" />
            <span>{Math.round(scrollProgress)}% read</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Main Post Content */}
        <main ref={setRef} id="post-main-scroll" className="flex-1 p-[20px] md:p-[40px] overflow-y-auto bg-editorial-bg focus:outline-none">
          {loading ? (
            <PostDetailSkeleton />
          ) : !post ? (
            <div className="flex flex-col items-center justify-center text-center py-12 min-h-[300px]">
              <Link 
                to="/" 
                className="inline-flex items-center gap-[8px] text-[12px] font-bold uppercase tracking-[1px] text-editorial-muted hover:text-editorial-text transition-colors mb-[24px]"
              >
                &larr; Back to chronicles
              </Link>
              <div className="text-editorial-muted font-serif italic text-lg">Post not found</div>
            </div>
          ) : (
            <>
              <Link 
                to="/" 
                className="inline-flex items-center gap-[8px] text-[12px] font-bold uppercase tracking-[1px] text-editorial-muted hover:text-editorial-text transition-colors mb-[24px] focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none"
                aria-label="Back to main chronicles feed"
              >
                &larr; Back to chronicles
              </Link>
              
              <motion.article 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl"
              >
                <header className="mb-[30px]">
                  {post.category && (
                    <div className="mb-[16px] flex items-center gap-[6px] text-editorial-accent">
                      <Folder className="w-[14px] h-[14px]" aria-hidden="true" />
                      <Link 
                        to={`/?category=${post.category}`} 
                        className="text-[11px] font-bold uppercase tracking-[1px] hover:underline focus-visible:ring-1 focus-visible:ring-editorial-accent outline-none"
                        aria-label={`Category: ${categories.find(c => c.id === post.category)?.name || "Chronicle"}`}
                      >
                        {categories.find(c => c.id === post.category)?.name || "Chronicle"}
                      </Link>
                    </div>
                  )}
                  
                  <h1 id="post-main-title" className="font-serif text-[36px] md:text-[48px] lg:text-[56px] leading-[1.05] tracking-[-1.2px] text-editorial-text mb-[24px]">
                    {post.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-editorial-border pb-4">
                    <div className="flex items-center gap-[12px]">
                      <div className="w-[36px] h-[36px] bg-editorial-text text-editorial-bg rounded-full flex items-center justify-center text-[11px] font-bold uppercase">
                        {post.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <Link 
                          to={`/author/${post.authorId}`} 
                          className="font-semibold text-[14px] text-editorial-text hover:underline focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none"
                        >
                          {post.authorName}
                        </Link>
                        <div className="text-[11px] text-editorial-muted uppercase tracking-[0.5px]">Posted {formatDistanceToNow(post.createdAt, { addSuffix: true })}</div>
                      </div>
                    </div>

                    {/* Reach and Engagement Features */}
                    <div className="flex items-center gap-3 text-[12px] text-editorial-muted font-mono flex-wrap">
                      <div className="flex items-center gap-1.5" title={`${views} views`}>
                        <Eye className="w-4 h-4 text-editorial-muted shrink-0" aria-hidden="true" />
                        <span>{views} views</span>
                      </div>
                      
                      <button 
                        onClick={handleLike}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all border focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none ${hasLiked ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-editorial-panel hover:bg-editorial-active text-editorial-muted hover:text-editorial-text border-editorial-border"}`}
                        aria-label={hasLiked ? "Unlike this chronicle" : "Like this chronicle"}
                        aria-pressed={hasLiked}
                      >
                        <Heart className={`w-4 h-4 shrink-0 ${hasLiked ? "fill-red-500 text-red-500" : "text-editorial-muted"}`} aria-hidden="true" />
                        <span className="font-bold">{likes}</span>
                      </button>

                      <button 
                        onClick={() => {
                          setIsCommentsOpen(!isCommentsOpen);
                          setIsMobileCommentsOpen(!isMobileCommentsOpen);
                          
                          // On mobile/tablet, if we are opening, scroll down to the bottom comments section
                          if (!isMobileCommentsOpen) {
                            setTimeout(() => {
                              const commentsElem = document.getElementById("mobile-conversations-panel-trigger");
                              if (commentsElem) {
                                commentsElem.scrollIntoView({ behavior: "smooth" });
                              }
                            }, 100);
                          }
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all border focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none ${
                          isCommentsOpen 
                            ? "bg-editorial-accent/10 text-editorial-accent border-editorial-accent/20" 
                            : "bg-editorial-panel hover:bg-editorial-active text-editorial-muted hover:text-editorial-text border-editorial-border"
                        }`}
                        aria-label={isCommentsOpen ? "Close conversations" : "Open conversations"}
                        aria-expanded={isCommentsOpen}
                      >
                        <MessageSquare className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span className="font-bold">Conversations ({comments.length})</span>
                      </button>
                    </div>

                    {canEditPost && (
                      <div className="flex items-center gap-[10px]">
                        <Link 
                          to={`/edit/${post.id}`}
                          className="px-[16px] py-[8px] text-[11px] font-bold uppercase tracking-[1px] border border-editorial-text text-editorial-text hover:bg-editorial-text hover:text-editorial-bg transition-colors focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none"
                        >
                          Edit
                        </Link>
                        <button 
                          onClick={handleDelete}
                          className="px-[16px] py-[8px] text-[11px] font-bold uppercase tracking-[1px] border border-editorial-accent text-editorial-accent hover:bg-editorial-accent hover:text-editorial-bg transition-colors focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none"
                        >
                          Archive
                        </button>
                      </div>
                    )}
                  </div>
                </header>

                {/* Display large background image in PostDetail using LazyImage */}
                {post.imageUrl && (
                  <div className="overflow-hidden border border-editorial-border aspect-[16/9] mb-[40px] bg-editorial-panel">
                    <LazyImage 
                      src={post.imageUrl} 
                      alt={post.title} 
                      priority={true}
                      className="w-full h-full object-cover filter grayscale-[5%] hover:grayscale-0 transition-all duration-700" 
                      wrapperClassName="w-full h-full"
                    />
                  </div>
                )}

                {/* Content body */}
                <div 
                  className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto font-serif text-[18px] leading-[1.75] text-editorial-text pb-[40px] whitespace-normal"
                  dangerouslySetInnerHTML={{ __html: post.content }} 
                />

                 {/* Tag Badges */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-[8px] border-b border-editorial-border pb-[20px] mb-[30px]" role="list" aria-label="Article tags">
                    <TagIcon className="w-[14px] h-[14px] text-editorial-muted" aria-hidden="true" />
                    {post.tags.map(tagId => {
                      const tag = tags.find(t => t.id === tagId);
                      return tag ? (
                        <Link 
                          key={tag.id}
                          to={`/?tag=${tag.id}`}
                          className="text-[10px] font-bold uppercase tracking-[0.5px] px-[8px] py-[4px] bg-editorial-panel text-editorial-text hover:bg-editorial-border transition-colors rounded-full border border-editorial-border focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none"
                          role="listitem"
                          aria-label={`Tag: ${tag.name}`}
                        >
                          #{tag.name}
                        </Link>
                      ) : null;
                    })}
                  </div>
                )}

                {/* Author Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-b border-editorial-border py-[30px] my-[40px] gap-[20px]">
                  <div className="flex items-center gap-[15px]">
                    <div className="w-[60px] h-[60px] bg-editorial-text text-editorial-bg rounded-full flex items-center justify-center text-[20px] font-bold uppercase shrink-0">
                      {post.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-[18px] text-editorial-text">Written by <Link to={`/author/${post.authorId}`} className="hover:underline focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none">{post.authorName}</Link></h3>
                      <p className="text-[13px] text-editorial-muted mt-1 max-w-sm">
                        Verified curator and author sharing perspectives on technology, design, and culture.
                      </p>
                    </div>
                  </div>

                  {/* Social Share Buttons with full WCAG Accessibility */}
                  <div className="flex gap-[10px] flex-wrap" role="group" aria-label="Share this chronicle">
                    <button 
                      onClick={handleWebShare}
                      className="px-[12px] py-[6px] text-[11px] font-bold uppercase tracking-[1px] border border-editorial-text bg-editorial-text text-editorial-bg hover:bg-transparent hover:text-editorial-text transition-colors flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none"
                      aria-label="Share Blog"
                    >
                      <Share2 size={14} aria-hidden="true" />
                      {shareStatus}
                    </button>
                    <button 
                      onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                      className="px-[12px] py-[6px] text-[11px] font-bold uppercase tracking-[1px] border border-editorial-border text-editorial-text hover:bg-editorial-text hover:text-editorial-bg transition-colors flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none"
                      aria-label="Share on Twitter"
                    >
                      <Twitter size={14} aria-hidden="true" />
                      Share
                    </button>
                    <button 
                      onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(post.title)}`, '_blank')}
                      className="px-[12px] py-[6px] text-[11px] font-bold uppercase tracking-[1px] border border-editorial-border text-editorial-text hover:bg-editorial-text hover:text-editorial-bg transition-colors flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none"
                      aria-label="Share on LinkedIn"
                    >
                      <Linkedin size={14} aria-hidden="true" />
                      Share
                    </button>
                    <button 
                      onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                      className="px-[12px] py-[6px] text-[11px] font-bold uppercase tracking-[1px] border border-editorial-border text-editorial-text hover:bg-editorial-text hover:text-editorial-bg transition-colors flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none"
                      aria-label="Share on Facebook"
                    >
                      <Facebook size={14} aria-hidden="true" />
                      Share
                    </button>
                  </div>
                </div>

                {/* Algorithmic Related Articles Section with LazyImage */}
                {relatedPosts.length > 0 && (
                  <div className="mt-[60px] border-t border-editorial-border pt-[40px] pb-[20px]">
                    <h3 className="font-serif text-[24px] font-bold text-editorial-text mb-[24px]">
                      Related Chronicles
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-[24px]">
                      {relatedPosts.map((rp) => {
                        const rpCatName = categories.find(c => c.id === rp.category)?.name || "Chronicle";
                        return (
                          <Link 
                            key={rp.id} 
                            to={`/post/${rp.id}`} 
                            className="group flex flex-col gap-[12px] hover:opacity-95 transition-opacity focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none p-1"
                            aria-label={`Read related chronicle: ${rp.title}`}
                          >
                            {rp.imageUrl && (
                              <div className="overflow-hidden border border-editorial-border aspect-[16/10] bg-editorial-panel">
                                <LazyImage 
                                  src={rp.imageUrl} 
                                  alt={rp.title} 
                                  className="w-full h-full object-cover filter grayscale-[10%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                                  wrapperClassName="w-full h-full"
                                />
                              </div>
                            )}
                            <div>
                              <span className="text-[9px] font-bold uppercase tracking-[1.5px] text-editorial-accent">
                                {rpCatName}
                              </span>
                              <h4 className="font-serif text-[15px] font-bold text-editorial-text leading-[1.3] mt-1 group-hover:underline line-clamp-2">
                                {rp.title}
                              </h4>
                              <p className="text-[10px] text-editorial-muted mt-2 font-mono">
                                By {rp.authorName}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Newsletter />

                {/* Conversations Dropdown Section for Mobile/Tablet */}
                <div className="block lg:hidden mt-[40px] border-t border-editorial-border pt-[30px]" id="mobile-conversations-panel-trigger">
                  <button 
                    onClick={() => setIsMobileCommentsOpen(!isMobileCommentsOpen)}
                    className="w-full flex items-center justify-between py-3 px-4 bg-editorial-panel border border-editorial-border rounded text-[13px] font-bold uppercase tracking-[1px] text-editorial-text hover:bg-editorial-active transition-colors outline-none focus-visible:ring-2 focus-visible:ring-editorial-accent"
                    aria-expanded={isMobileCommentsOpen}
                    aria-controls="mobile-conversations-panel"
                  >
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-editorial-accent" />
                      <span>Conversations ({comments.length})</span>
                    </div>
                    <span className="text-[11px] font-mono">{isMobileCommentsOpen ? "▲ HIDE" : "▼ EXPAND"}</span>
                  </button>
                  
                  <AnimatePresence>
                    {isMobileCommentsOpen && (
                      <motion.div
                        id="mobile-conversations-panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 p-4 bg-editorial-panel border border-editorial-border rounded">
                          {renderCommentsListAndForm(true)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </motion.article>
            </>
          )}
          <div className="mt-16 -mx-[20px] md:-mx-[40px] -mb-[20px] md:-mb-[40px]">
            <Footer />
          </div>
        </main>

        {/* Conversations / Comments Section for Desktop */}
        <AnimatePresence>
          {!loading && post && isCommentsOpen && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 120 }}
              className="hidden lg:flex flex-col bg-editorial-panel border-l border-editorial-border h-full shrink-0 overflow-hidden" 
              aria-label="Article feedback and comments"
            >
              {renderCommentsListAndForm(false)}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
