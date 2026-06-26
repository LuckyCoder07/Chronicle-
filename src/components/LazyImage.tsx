import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  priority?: boolean;
}

export function LazyImage({ src, alt, className = "", wrapperClassName = "", priority = false, ...props }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Reset state when src changes
    setIsLoaded(false);
    setError(false);

    // If already complete in cache, set loaded instantly
    if (imgRef.current && imgRef.current.complete) {
      setIsLoaded(true);
    }
  }, [src]);

  // Double check complete state once ref becomes available or changes
  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div className={`relative overflow-hidden bg-editorial-active/30 ${wrapperClassName}`}>
      {/* Soft blurred placeholder background */}
      <AnimatePresence>
        {!isLoaded && !error && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center bg-editorial-active/60 backdrop-blur-sm z-10"
          >
            {/* Tiny stylized thumbnail placeholder/indicator */}
            <div className="w-8 h-8 border-2 border-editorial-muted/20 border-t-editorial-accent rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        {...(priority ? { fetchPriority: "high" } : {})}
        onLoad={handleImageLoad}
        onError={() => setError(true)}
        className={`transition-all duration-300 ease-out ${
          isLoaded ? "opacity-100 scale-100 filter-none" : "opacity-0 scale-105 filter blur-sm"
        } ${className}`}
        referrerPolicy="no-referrer"
        {...props}
      />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-editorial-active text-editorial-muted text-[11px] font-mono">
          Image unavailable
        </div>
      )}
    </div>
  );
}
