import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Post, Category } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, ArrowRight, Calendar, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { LazyImage } from "./LazyImage";

interface CarouselProps {
  posts: Post[];
  categories: Category[];
}

export function Carousel({ posts, categories }: CarouselProps) {
  const featuredPosts = posts.filter(p => p.isFeatured).slice(0, 5);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (featuredPosts.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 6000); // Auto-play every 6s
    return () => clearInterval(timer);
  }, [currentIndex, featuredPosts.length]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (featuredPosts.length <= 1) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    }
  };

  if (featuredPosts.length === 0) return null;

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? featuredPosts.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === featuredPosts.length - 1 ? 0 : prev + 1));
  };

  const currentPost = featuredPosts[currentIndex];
  const categoryName = categories.find(c => c.id === currentPost.category)?.name || "Feature";

  // Slide animations
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? "100%" : "-100%",
      opacity: 0
    })
  };

  return (
    <div 
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Featured Publications Carousel"
      className="relative w-full h-[320px] md:h-[460px] bg-editorial-panel border border-editorial-border overflow-hidden mb-[48px] group focus-visible:ring-2 focus-visible:ring-editorial-accent focus-visible:ring-offset-2 outline-none"
    >
      {/* Slides */}
      <div className="absolute inset-0">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentPost.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
            className="absolute inset-0 w-full h-full flex flex-col justify-end p-6 md:p-[48px] text-white"
          >
            {/* LazyImage as background with transition scale */}
            {currentPost.imageUrl && (
              <LazyImage
                src={currentPost.imageUrl}
                alt={currentPost.title}
                wrapperClassName="absolute inset-0 w-full h-full"
                className="w-full h-full object-cover transition-transform duration-[10000ms] scale-105 group-hover:scale-100"
              />
            )}
            
            {/* Custom dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/15 z-[2]" />

            {/* Content Card container */}
            <div className="relative z-10 max-w-3xl space-y-3 md:space-y-4">
              <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md text-[9px] md:text-[10px] font-bold uppercase tracking-[1.5px] border border-white/20 rounded-full text-white">
                {categoryName}
              </span>

              <h2 className="font-serif text-[24px] md:text-[40px] leading-[1.15] font-bold tracking-tight text-white line-clamp-2 md:line-clamp-3 hover:underline">
                <Link to={`/post/${currentPost.id}`} id={`featured-post-link-${currentPost.id}`}>
                  {currentPost.title}
                </Link>
              </h2>

              <div className="flex flex-wrap items-center gap-[15px] md:gap-[24px] text-[11px] md:text-[12px] text-white/80 font-sans">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[8px] font-bold uppercase">
                    {currentPost.authorName.charAt(0)}
                  </span>
                  <Link to={`/author/${currentPost.authorId}`} className="hover:underline font-medium text-white">{currentPost.authorName}</Link>
                </div>
                
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDistanceToNow(currentPost.createdAt, { addSuffix: true })}</span>
                </div>

                {currentPost.views !== undefined && (
                  <div className="text-[11px] bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm hidden sm:block">
                    {currentPost.views} views
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Link 
                  to={`/post/${currentPost.id}`}
                  className="inline-flex items-center gap-2 text-[11px] md:text-[12px] uppercase tracking-[1px] font-bold text-white hover:text-editorial-accent transition-colors group/btn"
                >
                  Read Full Chronicle
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Manual Control Arrows */}
      {featuredPosts.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/60 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 z-20 backdrop-blur-sm focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white outline-none"
            aria-label="Previous featured article"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/60 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 z-20 backdrop-blur-sm focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white outline-none"
            aria-label="Next featured article"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {featuredPosts.length > 1 && (
        <div className="absolute bottom-4 right-6 md:right-12 flex gap-1.5 z-20" role="tablist" aria-label="Featured slides selection">
          {featuredPosts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              role="tab"
              aria-selected={idx === currentIndex}
              aria-label={`Go to featured slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-white outline-none ${idx === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/45 hover:bg-white/70"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
